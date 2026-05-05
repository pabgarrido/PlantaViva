'use client';

import { useRef, useEffect, useState } from 'react';
import type { SceneGraph } from '@/lib/api';

const SCALE = 50; // px per meter
const PADDING = 40;

function drawScene(ctx: CanvasRenderingContext2D, scene: SceneGraph, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, width, height);

  const ox = PADDING;
  const oy = PADDING;

  // Floor colors
  const floorColors: Record<string, string> = {
    wood_oak_01: '#d4b896',
    tile_white_01: '#e8e8e8',
    tile_marble_01: '#f0ebe3',
  };

  // Draw rooms
  scene.rooms.forEach(room => {
    const poly = room.polygon;
    ctx.beginPath();
    ctx.moveTo(ox + poly[0][0] * SCALE, oy + poly[0][1] * SCALE);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(ox + poly[i][0] * SCALE, oy + poly[i][1] * SCALE);
    }
    ctx.closePath();
    ctx.fillStyle = floorColors[room.floor ?? ''] ?? '#e8ddd0';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Room label
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    ctx.fillStyle = '#5a4a3a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, ox + cx * SCALE, oy + cy * SCALE - 4);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#8a7a6a';
    ctx.fillText(`${room.ceilingHeight}m`, ox + cx * SCALE, oy + cy * SCALE + 10);
  });

  // Draw walls
  ctx.strokeStyle = '#3a3020';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  scene.walls.forEach(wall => {
    ctx.beginPath();
    ctx.moveTo(ox + wall.from[0] * SCALE, oy + wall.from[1] * SCALE);
    ctx.lineTo(ox + wall.to[0] * SCALE, oy + wall.to[1] * SCALE);
    ctx.stroke();
  });

  // Draw openings
  scene.openings.forEach(opening => {
    const wall = scene.walls.find(w => w.id === opening.wallId);
    if (!wall) return;
    const dx = wall.to[0] - wall.from[0];
    const dy = wall.to[1] - wall.from[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const px = wall.from[0] + dx * opening.position;
    const py = wall.from[1] + dy * opening.position;
    const hw = (opening.width / 2) / len;

    if (opening.type === 'door') {
      // Draw door as gap + arc
      ctx.strokeStyle = '#f5f0e8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE);
      ctx.lineTo(ox + (px + dx * hw) * SCALE, oy + (py + dy * hw) * SCALE);
      ctx.stroke();

      // Door arc
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 1;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.arc(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE, opening.width * SCALE * 0.9, angle, angle + Math.PI / 2);
      ctx.stroke();
    } else {
      // Window as double line
      ctx.strokeStyle = '#f5f0e8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE);
      ctx.lineTo(ox + (px + dx * hw) * SCALE, oy + (py + dy * hw) * SCALE);
      ctx.stroke();

      ctx.strokeStyle = '#5ba8d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE);
      ctx.lineTo(ox + (px + dx * hw) * SCALE, oy + (py + dy * hw) * SCALE);
      ctx.stroke();
    }
  });

  // Metadata badge
  ctx.fillStyle = 'rgba(30,58,95,0.85)';
  const badgeW = 200, badgeH = 28;
  ctx.fillRect(width - badgeW - 10, height - badgeH - 10, badgeW, badgeH);
  ctx.fillStyle = '#fff';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    `${scene.rooms.length} divisões · ${scene.walls.length} paredes · ${Math.round(scene.metadata.confidence * 100)}% confiança`,
    width - 18, height - 19
  );
}

export function SceneViewer({ scene }: { scene: SceneGraph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size from scene bounds
    let maxX = 0, maxY = 0;
    scene.walls.forEach(w => {
      maxX = Math.max(maxX, w.from[0], w.to[0]);
      maxY = Math.max(maxY, w.from[1], w.to[1]);
    });
    const cw = maxX * SCALE + PADDING * 2;
    const ch = maxY * SCALE + PADDING * 2;
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    drawScene(ctx, scene, cw, ch);
  }, [scene]);

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Planta — Vista {is3D ? '3D' : '2D'}</h3>
        <button
          onClick={() => setIs3D(prev => !prev)}
          className="rounded bg-navy-600 px-3 py-1 text-xs text-navy-100 hover:bg-navy-500 transition"
        >
          {is3D ? 'Vista 2D' : 'Vista 3D'}
        </button>
      </div>
      <div className="overflow-auto rounded bg-[#f5f0e8]" style={{ maxHeight: '500px' }}>
        <canvas ref={canvasRef} className="mx-auto" />
      </div>
    </div>
  );
}
