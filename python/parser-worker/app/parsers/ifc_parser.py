"""IFC parser — extracts walls, rooms, and openings from IFC files."""
from __future__ import annotations

import uuid
import math
from typing import Any

try:
    import ifcopenshell
    import ifcopenshell.geom
    HAS_IFC = True
except ImportError:
    HAS_IFC = False


def parse_ifc(file_path: str) -> dict[str, Any]:
    """Parse an IFC file and return a SceneGraph dict."""
    if not HAS_IFC:
        raise ImportError("ifcopenshell not installed — install with: pip install ifcopenshell")

    ifc = ifcopenshell.open(file_path)

    walls: list[dict] = []
    rooms: list[dict] = []
    openings: list[dict] = []

    # Extract walls
    for wall_entity in ifc.by_type("IfcWall"):
        placement = _get_placement(wall_entity)
        if not placement:
            continue
        length = _get_property(wall_entity, "Length", 3.0)
        height = _get_property(wall_entity, "Height", 2.7)
        thickness = _get_property(wall_entity, "Width", 0.15)

        x, y = placement
        # Approximate wall as a line from placement
        angle = _get_rotation(wall_entity)
        end_x = x + length * math.cos(angle)
        end_y = y + length * math.sin(angle)

        wall_id = str(uuid.uuid4())
        walls.append({
            "id": wall_id,
            "from": [round(x, 3), round(y, 3)],
            "to": [round(end_x, 3), round(end_y, 3)],
            "thickness": round(thickness, 3),
            "height": round(height, 3),
            "openings": [],
        })

    # Extract spaces (rooms)
    for space in ifc.by_type("IfcSpace"):
        name = space.LongName or space.Name or f"Espaço {len(rooms) + 1}"
        boundary = _get_space_boundary(space)
        if boundary:
            height = _get_property(space, "Height", 2.7)
            rooms.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "polygon": boundary,
                "ceilingHeight": round(height, 2),
            })

    # Extract doors and windows
    for door in ifc.by_type("IfcDoor"):
        placement = _get_placement(door)
        if placement:
            width = _get_property(door, "OverallWidth", 0.9)
            height = _get_property(door, "OverallHeight", 2.1)
            opening = _find_nearest_wall("door", placement, walls, width, height)
            if opening:
                openings.append(opening)

    for window in ifc.by_type("IfcWindow"):
        placement = _get_placement(window)
        if placement:
            width = _get_property(window, "OverallWidth", 1.2)
            height = _get_property(window, "OverallHeight", 1.4)
            opening = _find_nearest_wall("window", placement, walls, width, height)
            if opening:
                openings.append(opening)

    # If no spaces found, infer from walls
    if not rooms and walls:
        rooms = _infer_rooms(walls)

    for wall in walls:
        wall["openings"] = [o for o in openings if o["wallId"] == wall["id"]]

    confidence = 0.5
    if len(walls) >= 4: confidence += 0.2
    if len(rooms) >= 1: confidence += 0.15
    if len(openings) >= 1: confidence += 0.1
    confidence = min(confidence, 0.98)

    return {
        "schemaVersion": "1.0",
        "units": "meters",
        "rooms": rooms,
        "walls": walls,
        "openings": openings,
        "metadata": {
            "parsedFrom": "ifc",
            "confidence": round(confidence, 2),
            "needsReview": confidence < 0.85,
        },
    }


def _get_placement(entity: Any) -> tuple[float, float] | None:
    """Extract X, Y placement from an IFC entity."""
    try:
        placement = entity.ObjectPlacement
        if placement and hasattr(placement, "RelativePlacement"):
            rp = placement.RelativePlacement
            if hasattr(rp, "Location"):
                coords = rp.Location.Coordinates
                return (coords[0], coords[1])
    except Exception:
        pass
    return None


def _get_rotation(entity: Any) -> float:
    """Get wall rotation angle in radians."""
    try:
        rp = entity.ObjectPlacement.RelativePlacement
        if hasattr(rp, "RefDirection") and rp.RefDirection:
            dx, dy = rp.RefDirection.DirectionRatios[:2]
            return math.atan2(dy, dx)
    except Exception:
        pass
    return 0.0


def _get_property(entity: Any, prop_name: str, default: float) -> float:
    """Extract a property value from IFC property sets."""
    try:
        for definition in entity.IsDefinedBy:
            if hasattr(definition, "RelatingPropertyDefinition"):
                pset = definition.RelatingPropertyDefinition
                if hasattr(pset, "HasProperties"):
                    for prop in pset.HasProperties:
                        if prop.Name == prop_name and hasattr(prop, "NominalValue"):
                            return float(prop.NominalValue.wrappedValue)
    except Exception:
        pass
    return default


def _get_space_boundary(space: Any) -> list[list[float]] | None:
    """Extract boundary polygon from an IfcSpace."""
    try:
        rep = space.Representation
        if rep:
            for sr in rep.Representations:
                for item in sr.Items:
                    if hasattr(item, "OuterCurve"):
                        points = []
                        curve = item.OuterCurve
                        if hasattr(curve, "Points"):
                            for pt in curve.Points:
                                coords = pt.Coordinates
                                points.append([round(coords[0], 3), round(coords[1], 3)])
                        if len(points) >= 3:
                            return points
    except Exception:
        pass
    return None


def _find_nearest_wall(
    type_: str,
    pos: tuple[float, float],
    walls: list[dict],
    width: float,
    height: float,
) -> dict | None:
    best_wall = None
    best_dist = float("inf")
    best_t = 0.5

    for wall in walls:
        wf, wt = wall["from"], wall["to"]
        dx = wt[0] - wf[0]
        dy = wt[1] - wf[1]
        length_sq = dx * dx + dy * dy
        if length_sq < 0.01:
            continue
        t = max(0, min(1, ((pos[0] - wf[0]) * dx + (pos[1] - wf[1]) * dy) / length_sq))
        proj = (wf[0] + t * dx, wf[1] + t * dy)
        dist = math.dist(pos, proj)
        if dist < best_dist and dist < 1.0:
            best_dist = dist
            best_wall = wall
            best_t = t

    if not best_wall:
        return None

    return {
        "id": str(uuid.uuid4()),
        "type": type_,
        "wallId": best_wall["id"],
        "position": round(best_t, 3),
        "width": round(width, 3),
        "height": round(height, 3),
    }


def _infer_rooms(walls: list[dict]) -> list[dict]:
    xs = [w["from"][0] for w in walls] + [w["to"][0] for w in walls]
    ys = [w["from"][1] for w in walls] + [w["to"][1] for w in walls]
    return [{
        "id": str(uuid.uuid4()),
        "name": "Planta",
        "polygon": [
            [min(xs), min(ys)], [max(xs), min(ys)],
            [max(xs), max(ys)], [min(xs), max(ys)],
        ],
        "ceilingHeight": 2.7,
    }]
