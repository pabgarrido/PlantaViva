'use client';

import { useEffect, useState } from 'react';
import { api, Material, SceneGraph } from '@/lib/api';

interface Props {
  scene: SceneGraph;
  projectId: string;
  onSceneUpdate: (scene: SceneGraph) => void;
}

export function MaterialsBrowser({ scene, projectId, onSceneUpdate }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>(scene.rooms[0]?.id ?? '');
  const [lastApplied, setLastApplied] = useState<string | null>(null);

  useEffect(() => {
    api.materials.categories().then(setCategories).catch(console.error);
    api.materials.list().then(setMaterials).catch(console.error);
  }, []);

  useEffect(() => {
    api.materials.list({ category: selectedCategory || undefined, q: search || undefined })
      .then(setMaterials)
      .catch(console.error);
  }, [selectedCategory, search]);

  const applyMaterial = async (mat: Material) => {
    const updatedRooms = scene.rooms.map(r =>
      r.id === selectedRoom ? { ...r, floor: mat.slug } : r
    );
    const updatedScene = { ...scene, rooms: updatedRooms };

    // Persist to API
    try {
      await api.scene.patch(projectId, { rooms: updatedRooms } as any);
    } catch (e) { console.error(e); }

    onSceneUpdate(updatedScene);
    setLastApplied(mat.namePt);
    setTimeout(() => setLastApplied(null), 3000);
  };

  const categoryLabels: Record<string, string> = {
    floor: 'Pavimento', wall: 'Parede', countertop: 'Bancada', ceiling: 'Teto',
    door: 'Porta', window: 'Janela', bathroom: 'WC', kitchen: 'Cozinha', exterior: 'Exterior',
  };

  const selectedRoomObj = scene.rooms.find(r => r.id === selectedRoom);

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
      <h3 className="mb-3 text-lg font-semibold">Materiais</h3>

      {/* Room selector */}
      <div className="mb-3">
        <label className="text-xs text-navy-100 mb-1 block">Aplicar na divisão:</label>
        <div className="flex flex-wrap gap-1.5">
          {scene.rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`rounded-full px-3 py-1 text-xs transition ${selectedRoom === room.id ? 'bg-terracotta-500 text-white' : 'bg-navy-600 text-navy-100 hover:bg-navy-500'}`}
            >
              {room.name}
            </button>
          ))}
        </div>
        {selectedRoomObj?.floor && (
          <p className="text-xs text-navy-100 mt-1">Atual: <span className="text-terracotta-400">{selectedRoomObj.floor.replace(/_/g, ' ')}</span></p>
        )}
      </div>

      {lastApplied && (
        <div className="mb-3 rounded bg-green-900/30 border border-green-800 px-3 py-2 text-xs text-green-400">
          ✓ {lastApplied} aplicado em {selectedRoomObj?.name}
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar materiais..."
          className="w-full rounded border border-navy-600 bg-navy-700 px-3 py-1.5 text-sm text-white placeholder-navy-100 focus:border-terracotta-400 focus:outline-none" />
      </div>

      {/* Category pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button onClick={() => setSelectedCategory('')}
          className={`rounded-full px-3 py-1 text-xs transition ${!selectedCategory ? 'bg-terracotta-500 text-white' : 'bg-navy-600 text-navy-100 hover:bg-navy-500'}`}>
          Todos
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs transition ${selectedCategory === cat ? 'bg-terracotta-500 text-white' : 'bg-navy-600 text-navy-100 hover:bg-navy-500'}`}>
            {categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Material list */}
      <div className="max-h-[250px] overflow-y-auto space-y-1.5">
        {materials.map(mat => (
          <div key={mat.id}
            className="flex items-center justify-between rounded bg-navy-600/50 px-3 py-2 hover:bg-navy-600 transition cursor-pointer"
            onClick={() => applyMaterial(mat)}>
            <div>
              <p className="text-sm font-medium">{mat.namePt}</p>
              <p className="text-xs text-navy-100">{categoryLabels[mat.category] ?? mat.category}{mat.supplier && ` · ${mat.supplier}`}</p>
            </div>
            <button className="rounded bg-terracotta-500/20 px-2 py-1 text-xs text-terracotta-400 hover:bg-terracotta-500/40 transition">Aplicar</button>
          </div>
        ))}
        {materials.length === 0 && <p className="text-sm text-navy-100">Nenhum material encontrado.</p>}
      </div>
    </div>
  );
}
