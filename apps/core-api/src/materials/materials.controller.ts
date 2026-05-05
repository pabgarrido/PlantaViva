import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('supplier') supplier?: string,
    @Query('q') q?: string,
  ) {
    return this.materialsService.findAll({ category, supplier, q });
  }

  @Get('categories')
  getCategories() {
    return this.materialsService.getCategories();
  }

  @Get('suppliers')
  getSuppliers() {
    return this.materialsService.getSuppliers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const material = this.materialsService.findOne(id);
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }
}
