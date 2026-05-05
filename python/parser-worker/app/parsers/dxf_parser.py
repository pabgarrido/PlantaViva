"""DXF parser — extracts walls, rooms, and openings from DXF files using ezdxf."""
from __future__ import annotations

import math
import uuid
from typing import Any

import ezdxf
from ezdxf.entities import Line, LWPolyline, Polyline, Insert


def parse_dxf(file_path: str) -> dict[str, Any]:
    """Parse a DXF file and return a SceneGraph dict."""
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    walls: list[dict] = []
    rooms: list[dict] = []
    openings: list[dict] = []

    # Track all line segments for wall detection
    segments: list[tuple[tuple[float, float], tuple[float, float]]] = []

    # Extract LINE entities as walls
    for entity in msp.query("LINE"):
        start = (round(entity.dxf.start.x / 1000, 3), round(entity.dxf.start.y / 1000, 3))
        end = (round(entity.dxf.end.x / 1000, 3), round(entity.dxf.end.y / 1000, 3))
        length = math.dist(start, end)
        if length < 0.1:  # skip tiny segments
            continue
        segments.append((start, end))
        wall_id = str(uuid.uuid4())
        walls.append({
            "id": wall_id,
            "from": list(start),
            "to": list(end),
            "thickness": 0.15,
            "height": 2.7,
            "openings": [],
        })

    # Extract LWPOLYLINE entities — could be room outlines or walls
    for entity in msp.query("LWPOLYLINE"):
        points = [(round(p[0] / 1000, 3), round(p[1] / 1000, 3)) for p in entity.get_points(format="xy")]
        if len(points) < 3:
            continue

        if entity.closed or (len(points) > 2 and math.dist(points[0], points[-1]) < 0.05):
            # Closed polyline → likely a room
            area = _polygon_area(points)
            if area > 1.0:  # min 1 m² to be a room
                rooms.append({
                    "id": str(uuid.uuid4()),
                    "name": _guess_room_name(entity, len(rooms)),
                    "polygon": [list(p) for p in points],
                    "ceilingHeight": 2.7,
                })
        else:
            # Open polyline → wall segments
            for i in range(len(points) - 1):
                length = math.dist(points[i], points[i + 1])
                if length < 0.1:
                    continue
                walls.append({
                    "id": str(uuid.uuid4()),
                    "from": list(points[i]),
                    "to": list(points[i + 1]),
                    "thickness": 0.15,
                    "height": 2.7,
                    "openings": [],
                })

    # Extract INSERT (block references) for doors/windows
    for entity in msp.query("INSERT"):
        block_name = entity.dxf.name.lower()
        pos = (round(entity.dxf.insert.x / 1000, 3), round(entity.dxf.insert.y / 1000, 3))

        if any(kw in block_name for kw in ("door", "porta", "puerta", "tür")):
            opening = _create_opening("door", pos, walls, 0.9, 2.1)
            if opening:
                openings.append(opening)
        elif any(kw in block_name for kw in ("window", "janela", "ventana", "fenster")):
            opening = _create_opening("window", pos, walls, 1.2, 1.4)
            if opening:
                openings.append(opening)

    # If no rooms detected from polylines, try to infer from walls
    if not rooms and walls:
        rooms = _infer_rooms_from_walls(walls)

    # Attach openings to walls
    for wall in walls:
        wall["openings"] = [o for o in openings if o["wallId"] == wall["id"]]

    confidence = _calculate_confidence(walls, rooms, openings)

    return {
        "schemaVersion": "1.0",
        "units": "meters",
        "rooms": rooms,
        "walls": walls,
        "openings": openings,
        "metadata": {
            "parsedFrom": "dxf",
            "confidence": confidence,
            "needsReview": confidence < 0.85,
        },
    }


def _polygon_area(points: list[tuple[float, float]]) -> float:
    """Shoelace formula for polygon area."""
    n = len(points)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    return abs(area) / 2.0


def _guess_room_name(entity: Any, index: int) -> str:
    """Try to extract room name from entity layer or attributes."""
    layer = entity.dxf.layer.lower() if hasattr(entity.dxf, "layer") else ""
    room_keywords = {
        "sala": "Sala", "living": "Sala", "estar": "Sala",
        "cozinha": "Cozinha", "kitchen": "Cozinha", "cocina": "Cozinha",
        "quarto": "Quarto", "bedroom": "Quarto", "dormitorio": "Quarto",
        "wc": "WC", "bath": "WC", "banho": "WC", "toilet": "WC",
        "corredor": "Corredor", "hall": "Corredor", "pasillo": "Corredor",
        "varanda": "Varanda", "balcon": "Varanda",
        "escritorio": "Escritório", "office": "Escritório",
        "garagem": "Garagem", "garage": "Garagem",
    }
    for kw, name in room_keywords.items():
        if kw in layer:
            return name
    return f"Divisão {index + 1}"


def _create_opening(
    type_: str,
    pos: tuple[float, float],
    walls: list[dict],
    width: float,
    height: float,
) -> dict | None:
    """Find the nearest wall and create an opening on it."""
    best_wall = None
    best_dist = float("inf")
    best_pos = 0.5

    for wall in walls:
        wf = wall["from"]
        wt = wall["to"]
        # Project point onto wall segment
        dx = wt[0] - wf[0]
        dy = wt[1] - wf[1]
        length_sq = dx * dx + dy * dy
        if length_sq < 0.01:
            continue
        t = max(0, min(1, ((pos[0] - wf[0]) * dx + (pos[1] - wf[1]) * dy) / length_sq))
        proj_x = wf[0] + t * dx
        proj_y = wf[1] + t * dy
        dist = math.dist(pos, (proj_x, proj_y))
        if dist < best_dist and dist < 0.5:  # within 50cm of wall
            best_dist = dist
            best_wall = wall
            best_pos = t

    if not best_wall:
        return None

    return {
        "id": str(uuid.uuid4()),
        "type": type_,
        "wallId": best_wall["id"],
        "position": round(best_pos, 3),
        "width": width,
        "height": height,
    }


def _infer_rooms_from_walls(walls: list[dict]) -> list[dict]:
    """Basic room inference: create a bounding box room from all walls."""
    xs = []
    ys = []
    for w in walls:
        xs.extend([w["from"][0], w["to"][0]])
        ys.extend([w["from"][1], w["to"][1]])

    if not xs:
        return []

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    return [{
        "id": str(uuid.uuid4()),
        "name": "Planta",
        "polygon": [
            [min_x, min_y], [max_x, min_y],
            [max_x, max_y], [min_x, max_y],
        ],
        "ceilingHeight": 2.7,
    }]


def _calculate_confidence(walls: list, rooms: list, openings: list) -> float:
    """Heuristic confidence score based on extraction quality."""
    score = 0.5
    if len(walls) >= 4:
        score += 0.15
    if len(rooms) >= 1:
        score += 0.15
    if len(openings) >= 1:
        score += 0.1
    if len(rooms) >= 3:
        score += 0.05
    if len(openings) >= 3:
        score += 0.05
    return min(score, 0.98)
