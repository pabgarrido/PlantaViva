import { Injectable } from '@nestjs/common';
import type { Material } from '@plantaviva/types';
import { MATERIALS_SEED } from './materials.seed';

@Injectable()
export class MaterialsService {
  private materials: Material[] = [...MATERIALS_SEED];

  findAll(query?: { category?: string; supplier?: string; q?: string }): Material[] {
    let results = this.materials;
    if (query?.category) {
      results = results.filter(m => m.category === query.category);
    }
    if (query?.supplier) {
      results = results.filter(m => m.supplier?.toLowerCase().includes(query.supplier!.toLowerCase()));
    }
    if (query?.q) {
      const q = query.q.toLowerCase();
      results = results.filter(m =>
        m.namePt.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.tags.some(t => t.includes(q)) ||
        m.slug.includes(q)
      );
    }
    return results;
  }

  findOne(id: string): Material | undefined {
    return this.materials.find(m => m.id === id);
  }

  getCategories(): string[] {
    return [...new Set(this.materials.map(m => m.category))];
  }

  getSuppliers(): string[] {
    return [...new Set(this.materials.filter(m => m.supplier).map(m => m.supplier!))];
  }
}
