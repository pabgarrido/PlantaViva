'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line, Text } from '@react-three/drei';
import type { SceneGraph } from '@/lib/api';
import * as THREE from 'three';

function Wall({ from, to, height, thickness }: { from: [number,number]; to: [number,number]; height: number; thickness: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[1] + to[1]) / 2;

  return (
    <mesh position={[cx, height / 2, cz]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="#e8e0d4" transparent opacity={0.85} />
    </mesh>
  );
}

function Floor({ polygon, y = 0, color = '#c4a882' }: { polygon: [number,number][]; y?: number; color?: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(polygon[0][0], polygon[0][1]);
    for (let i = 1; i < polygon.length; i++) {
      s.lineTo(polygon[i][0], polygon[i][1]);
    }
    s.closePath();
    return s;
  }, [polygon]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

function RoomLabel({ name, polygon, height }: { name: string; polygon: [number,number][]; height: number }) {
  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
  const cz = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
  return (
    <Text position={[cx, height * 0.6, cz]} fontSize={0.3} color="#4a3520" anchorX="center" anchorY="middle">
      {name}
    </Text>
  );
}

function Opening({ type, wall, position, width, height: h }: {
  type: 'door' | 'window';
  wall: { from: [number,number]; to: [number,number] };
  position: number;
  width: number;
  height: number;
}) {
  const dx = wall.to[0] - wall.from[0];
  const dz = wall.to[1] - wall.from[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const ox = wall.from[0] + dx * position;
  const oz = wall.from[1] + dz * position;
  const yOff = type === 'window' ? 1.0 : 0;

  return (
    <mesh position={[ox, yOff + h / 2, oz]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[width, h, 0.2]} />
      <meshStandardMaterial color={type === 'window' ? '#a8d4e6' : '#8b6914'} transparent opacity={type === 'window' ? 0.4 : 0.8} />
    </mesh>
  );
}

function SceneContent({ scene }: { scene: SceneGraph }) {
  const floorColors: Record<string, string> = {
    wood_oak_01: '#c4a060',
    tile_white_01: '#e8e8e8',
    tile_marble_01: '#f0ebe3',
    default: '#c4a882',
  };

  return (
    <>
      {/* Floors */}
      {scene.rooms.map(room => (
        <Floor
          key={room.id}
          polygon={room.polygon}
          color={floorColors[room.floor ?? 'default'] ?? floorColors.default}
        />
      ))}

      {/* Walls */}
      {scene.walls.map(wall => (
        <Wall key={wall.id} from={wall.from} to={wall.to} height={wall.height} thickness={wall.thickness} />
      ))}

      {/* Openings */}
      {scene.openings.map(opening => {
        const wall = scene.walls.find(w => w.id === opening.wallId);
        if (!wall) return null;
        return (
          <Opening
            key={opening.id}
            type={opening.type}
            wall={wall}
            position={opening.position}
            width={opening.width}
            height={opening.height}
          />
        );
      })}

      {/* Room labels */}
      {scene.rooms.map(room => (
        <RoomLabel key={`label-${room.id}`} name={room.name} polygon={room.polygon} height={room.ceilingHeight} />
      ))}
    </>
  );
}

export function SceneViewer({ scene }: { scene: SceneGraph }) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-navy-700 bg-gradient-to-b from-sky-200 to-sky-50">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={50} />
        <OrbitControls target={[5.5, 0, 3.75]} maxPolarAngle={Math.PI / 2.1} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 8]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 8, -3]} intensity={0.3} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, -0.01, 3.75]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#7cb37c" />
        </mesh>

        <SceneContent scene={scene} />
      </Canvas>
    </div>
  );
}
