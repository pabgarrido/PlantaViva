'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { SceneGraph } from '@/lib/api';

const SCALE = 50;
const PADDING = 40;

/** Material slug → fill color mapping */
const MATERIAL_COLORS: Record<string, string> = {
  wood_oak_01: '#c49a6c', wood_pine_01: '#dfc89e', wood_walnut_01: '#6b4226', wood_cherry_01: '#a0522d',
  wood_bamboo_01: '#c8b560', tile_white_01: '#eaeaea', tile_grey_01: '#b0b0b0', tile_marble_01: '#f0ebe3',
  tile_terracotta_01: '#c2622d', tile_cement_01: '#4a7fa5', tile_slate_01: '#4a4a4a', tile_limestone_01: '#d4c9a8',
  floor_concrete_01: '#a0a0a0', floor_vinyl_01: '#c4a878', floor_cork_01: '#b8956a',
  paint_white_01: '#fafafa', paint_cream_01: '#f5e6c8', paint_grey_01: '#c8c0b8',
  paint_blue_01: '#3a6fa0', paint_terracotta_01: '#c87040', paint_sage_01: '#8faa7a', paint_charcoal_01: '#3a3a3a',
  bath_tile_01: '#e0e0e0', bath_tile_02: '#8a8a8a',
};

function drawScene(ctx: CanvasRenderingContext2D, scene: SceneGraph, width: number, height: number, renderMode = false) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = renderMode ? '#ffffff' : '#f5f0e8';
  ctx.fillRect(0, 0, width, height);

  const ox = PADDING;
  const oy = PADDING;

  // Draw rooms with material colors
  scene.rooms.forEach(room => {
    const poly = room.polygon;
    ctx.beginPath();
    ctx.moveTo(ox + poly[0][0] * SCALE, oy + poly[0][1] * SCALE);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(ox + poly[i][0] * SCALE, oy + poly[i][1] * SCALE);
    }
    ctx.closePath();
    ctx.fillStyle = MATERIAL_COLORS[room.floor ?? ''] ?? '#e8ddd0';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Room label
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, ox + cx * SCALE, oy + cy * SCALE - 6);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#7a6a5a';
    if (room.floor) {
      const slug = room.floor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/0\d/, '');
      ctx.fillText(slug.trim(), ox + cx * SCALE, oy + cy * SCALE + 8);
    }
    ctx.fillText(`${room.ceilingHeight}m`, ox + cx * SCALE, oy + cy * SCALE + 20);
  });

  // Draw walls
  ctx.strokeStyle = '#2a2010';
  ctx.lineWidth = 4;
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
    if (len < 0.01) return;
    const px = wall.from[0] + dx * opening.position;
    const py = wall.from[1] + dy * opening.position;
    const hw = (opening.width / 2) / len;

    // Clear wall segment
    ctx.strokeStyle = renderMode ? '#ffffff' : '#f5f0e8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE);
    ctx.lineTo(ox + (px + dx * hw) * SCALE, oy + (py + dy * hw) * SCALE);
    ctx.stroke();

    if (opening.type === 'door') {
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 1.5;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.arc(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE, opening.width * SCALE * 0.85, angle, angle + Math.PI / 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#4a9ec8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox + (px - dx * hw) * SCALE, oy + (py - dy * hw) * SCALE);
      ctx.lineTo(ox + (px + dx * hw) * SCALE, oy + (py + dy * hw) * SCALE);
      ctx.stroke();
      ctx.strokeStyle = '#8ad0f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  // Title + badge
  if (renderMode) {
    ctx.fillStyle = '#1e3a5f';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PlantaViva', PADDING, height - 20);
    ctx.fillStyle = '#888';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${scene.rooms.length} divisões · ${scene.walls.length} paredes · ${Math.round(scene.metadata.confidence * 100)}% confiança`, PADDING + 120, height - 20);
  } else {
    ctx.fillStyle = 'rgba(30,58,95,0.85)';
    ctx.fillRect(width - 210, height - 38, 200, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${scene.rooms.length} div · ${scene.walls.length} paredes · ${Math.round(scene.metadata.confidence * 100)}%`, width - 18, height - 19);
  }
}

export interface SceneViewerHandle {
  exportPNG: () => string | null;
}

export const SceneViewer = forwardRef<SceneViewerHandle, { scene: SceneGraph }>(
  function SceneViewer({ scene }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getCanvasSize = () => {
      let maxX = 0, maxY = 0;
      scene.walls.forEach(w => {
        maxX = Math.max(maxX, w.from[0], w.to[0]);
        maxY = Math.max(maxY, w.from[1], w.to[1]);
      });
      scene.rooms.forEach(r => r.polygon.forEach(p => { maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); }));
      return { cw: maxX * SCALE + PADDING * 2, ch: maxY * SCALE + PADDING * 2 + 30 };
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { cw, ch } = getCanvasSize();
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      drawScene(ctx, scene, cw, ch);
    }, [scene]);

    useImperativeHandle(ref, () => ({
      exportPNG: () => {
        // Create a high-res offscreen canvas for render
        const { cw, ch } = getCanvasSize();
        const scale = 2; // 2x resolution
        const offscreen = document.createElement('canvas');
        offscreen.width = cw * scale;
        offscreen.height = ch * scale;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return null;
        ctx.scale(scale, scale);
        drawScene(ctx, scene, cw, ch, true);
        return offscreen.toDataURL('image/png');
      },
    }));

    return (
      <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Planta</h3>
        </div>
        <div className="overflow-auto rounded bg-[#f5f0e8]" style={{ maxHeight: '500px' }}>
          <canvas ref={canvasRef} className="mx-auto" />
        </div>
      </div>
    );
  }
);
