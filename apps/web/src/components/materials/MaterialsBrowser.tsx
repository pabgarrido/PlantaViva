'use client';

import { useEffect, useState } from 'react';
import { api, Material } from '@/lib/api';

interface Props {
  onApply?: (material: Material) => void;
}

export function MaterialsBrowser({ onApply }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.materials.categories().then(setCategories).catch(console.error);
    api.materials.list().then(setMaterials).catch(console.error);
  }, []);

  useEffect(() => {
    api.materials.list({ category: selectedCategory || undefined, q: search || undefined })
      .then(setMaterials)
      .catch(console.error);
  }, [selectedCategory, search]);

  const categoryLabels: Record<string, string> = {
    floor: 'Pavimento',
    wall: 'Parede',
    countertop: 'Bancada',
    ceiling: 'Teto',
    door: 'Porta',
    window: 'Janela',
    bathroom: 'WC',
    kitchen: 'Cozinha',
    exterior: 'Exterior',
  };

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
      <h3 className="mb-3 text-lg font-semibold">Materiais</h3>

      {/* Filters */}
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar..."
          className="flex-1 rounded border border-navy-600 bg-navy-700 px-3 py-1.5 text-sm text-white placeholder-navy-100 focus:border-terracotta-400 focus:outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory('')}
          className={`rounded-full px-3 py-1 text-xs transition ${!selectedCategory ? 'bg-terracotta-500 text-white' : 'bg-navy-600 text-navy-100 hover:bg-navy-500'}`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs transition ${selectedCategory === cat ? 'bg-terracotta-500 text-white' : 'bg-navy-600 text-navy-100 hover:bg-navy-500'}`}
          >
            {categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Material grid */}
      <div className="max-h-[300px] overflow-y-auto space-y-1.5">
        {materials.map(mat => (
          <div
            key={mat.id}
            className="flex items-center justify-between rounded bg-navy-600/50 px-3 py-2 hover:bg-navy-600 transition cursor-pointer"
            onClick={() => onApply?.(mat)}
          >
            <div>
              <p className="text-sm font-medium">{mat.namePt}</p>
              <p className="text-xs text-navy-100">
                {categoryLabels[mat.category] ?? mat.category}
                {mat.supplier && ` · ${mat.supplier}`}
              </p>
            </div>
            <button className="rounded bg-terracotta-500/20 px-2 py-1 text-xs text-terracotta-400 hover:bg-terracotta-500/40 transition">
              Aplicar
            </button>
          </div>
        ))}
        {materials.length === 0 && <p className="text-sm text-navy-100">Nenhum material encontrado.</p>}
      </div>
    </div>
  );
}
