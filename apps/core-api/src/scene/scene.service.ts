import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SceneGraph, SceneWall, SceneRoom, SceneOpening, FileType } from '@plantaviva/types';
import { JsonStore } from '../common/json-store';

@Injectable()
export class SceneService {
  private scenes = new JsonStore<SceneGraph>('scenes');

  get(projectId: string): SceneGraph | null {
    return this.scenes.get(projectId) ?? null;
  }

  save(projectId: string, scene: SceneGraph): SceneGraph {
    this.scenes.set(projectId, scene);
    return scene;
  }

  patch(projectId: string, partial: Partial<SceneGraph>): SceneGraph | null {
    const existing = this.scenes.get(projectId);
    if (!existing) return null;
    const updated = { ...existing, ...partial };
    this.scenes.set(projectId, updated);
    return updated;
  }

  /** Generate a demo scene for dev/testing — a simple T3 apartment */
  generateDemo(projectId: string, fileType: FileType): SceneGraph {
    const scene: SceneGraph = {
      schemaVersion: '1.0',
      units: 'meters',
      rooms: [
        { id: randomUUID(), name: 'Sala', polygon: [[0,0],[6,0],[6,4],[0,4]], ceilingHeight: 2.7, floor: 'wood_oak_01' },
        { id: randomUUID(), name: 'Cozinha', polygon: [[6,0],[9,0],[9,4],[6,4]], ceilingHeight: 2.7, floor: 'tile_white_01' },
        { id: randomUUID(), name: 'Quarto 1', polygon: [[0,4],[4,4],[4,7.5],[0,7.5]], ceilingHeight: 2.7, floor: 'wood_oak_01' },
        { id: randomUUID(), name: 'Quarto 2', polygon: [[4,4],[8,4],[8,7.5],[4,7.5]], ceilingHeight: 2.7, floor: 'wood_oak_01' },
        { id: randomUUID(), name: 'Quarto 3', polygon: [[8,4],[11,4],[11,7.5],[8,7.5]], ceilingHeight: 2.7, floor: 'wood_oak_01' },
        { id: randomUUID(), name: 'WC', polygon: [[8,0],[11,0],[11,2.5],[8,2.5]], ceilingHeight: 2.5, floor: 'tile_marble_01' },
        { id: randomUUID(), name: 'Corredor', polygon: [[4,4],[8,4],[8,4.8],[4,4.8]], ceilingHeight: 2.7 },
      ],
      walls: this.generateWalls(),
      openings: [],
      metadata: {
        parsedFrom: fileType,
        confidence: 0.92,
        needsReview: true,
      },
    };

    // Generate openings for the walls
    scene.openings = this.generateOpenings(scene.walls);
    scene.walls.forEach(w => {
      w.openings = scene.openings.filter(o => o.wallId === w.id);
    });

    this.scenes.set(projectId, scene);
    return scene;
  }

  private generateWalls(): SceneWall[] {
    const walls: SceneWall[] = [];
    const make = (from: [number,number], to: [number,number]): SceneWall => ({
      id: randomUUID(), from, to, thickness: 0.15, height: 2.7, openings: [],
    });
    // Exterior walls
    walls.push(make([0,0],[11,0]));   // south
    walls.push(make([11,0],[11,7.5])); // east
    walls.push(make([11,7.5],[0,7.5])); // north
    walls.push(make([0,7.5],[0,0]));   // west
    // Interior walls
    walls.push(make([6,0],[6,4]));     // sala/cozinha divider
    walls.push(make([8,0],[8,2.5]));   // wc west wall
    walls.push(make([8,2.5],[11,2.5])); // wc north wall
    walls.push(make([0,4],[11,4]));    // bedrooms south wall
    walls.push(make([4,4],[4,7.5]));   // bedroom 1/2 divider
    walls.push(make([8,4],[8,7.5]));   // bedroom 2/3 divider
    return walls;
  }

  private generateOpenings(walls: SceneWall[]): SceneOpening[] {
    const openings: SceneOpening[] = [];
    const door = (wallId: string, pos: number): SceneOpening => ({
      id: randomUUID(), type: 'door', wallId, position: pos, width: 0.9, height: 2.1,
    });
    const window_ = (wallId: string, pos: number): SceneOpening => ({
      id: randomUUID(), type: 'window', wallId, position: pos, width: 1.2, height: 1.4,
    });
    // Doors on interior walls
    if (walls[4]) openings.push(door(walls[4].id, 0.5));  // sala→cozinha
    if (walls[7]) openings.push(door(walls[7].id, 0.2));  // corredor→quarto1
    if (walls[7]) openings.push(door(walls[7].id, 0.55)); // corredor→quarto2
    if (walls[7]) openings.push(door(walls[7].id, 0.85)); // corredor→quarto3
    if (walls[5]) openings.push(door(walls[5].id, 0.5));  // wc door
    // Windows on exterior walls
    if (walls[0]) openings.push(window_(walls[0].id, 0.3));  // south sala
    if (walls[0]) openings.push(window_(walls[0].id, 0.7));  // south cozinha
    if (walls[2]) openings.push(window_(walls[2].id, 0.15)); // north quarto1
    if (walls[2]) openings.push(window_(walls[2].id, 0.5));  // north quarto2
    if (walls[2]) openings.push(window_(walls[2].id, 0.85)); // north quarto3
    return openings;
  }
}
