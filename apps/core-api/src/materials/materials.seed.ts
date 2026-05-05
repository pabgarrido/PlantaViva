import type { Material } from '@plantaviva/types';
import { randomUUID } from 'crypto';

/** Seed Portuguese materials catalog — 50 real products */
export const MATERIALS_SEED: Material[] = [
  // FLOORS — Wood
  { id: randomUUID(), slug: 'wood_oak_01', namePt: 'Carvalho Natural', nameEs: 'Roble Natural', nameEn: 'Natural Oak', category: 'floor', supplier: 'Sonae Arauco', tags: ['madeira','carvalho','natural'], pbrMaps: { albedo: '/materials/wood_oak_01/albedo.jpg', normal: '/materials/wood_oak_01/normal.jpg', roughness: '/materials/wood_oak_01/roughness.jpg' } },
  { id: randomUUID(), slug: 'wood_pine_01', namePt: 'Pinho Nórdico', nameEs: 'Pino Nórdico', nameEn: 'Nordic Pine', category: 'floor', supplier: 'Sonae Arauco', tags: ['madeira','pinho','claro'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wood_walnut_01', namePt: 'Nogueira Escuro', nameEs: 'Nogal Oscuro', nameEn: 'Dark Walnut', category: 'floor', supplier: 'Sonae Arauco', tags: ['madeira','nogueira','escuro'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wood_cherry_01', namePt: 'Cerejeira', nameEs: 'Cerezo', nameEn: 'Cherry', category: 'floor', supplier: 'Sonae Arauco', tags: ['madeira','cerejeira','quente'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wood_bamboo_01', namePt: 'Bambu Carbonizado', nameEs: 'Bambú Carbonizado', nameEn: 'Carbonized Bamboo', category: 'floor', supplier: 'Sonae Arauco', tags: ['madeira','bambu','sustentável'], pbrMaps: {} },
  // FLOORS — Tiles
  { id: randomUUID(), slug: 'tile_white_01', namePt: 'Branco Brilhante 60x60', nameEs: 'Blanco Brillante 60x60', nameEn: 'Glossy White 60x60', category: 'floor', supplier: 'Recer', tags: ['cerâmica','branco','brilhante'], pbrMaps: { albedo: '/materials/tile_white_01/albedo.jpg' } },
  { id: randomUUID(), slug: 'tile_grey_01', namePt: 'Cinza Mate 60x60', nameEs: 'Gris Mate 60x60', nameEn: 'Matte Grey 60x60', category: 'floor', supplier: 'Margres', tags: ['cerâmica','cinza','mate'], pbrMaps: {} },
  { id: randomUUID(), slug: 'tile_marble_01', namePt: 'Mármore Calacatta', nameEs: 'Mármol Calacatta', nameEn: 'Calacatta Marble', category: 'floor', supplier: 'Margres', tags: ['mármore','luxo','branco'], pbrMaps: {} },
  { id: randomUUID(), slug: 'tile_terracotta_01', namePt: 'Terracota Rústica', nameEs: 'Terracota Rústica', nameEn: 'Rustic Terracotta', category: 'floor', supplier: 'Cinca', tags: ['cerâmica','terracota','rústico'], pbrMaps: {} },
  { id: randomUUID(), slug: 'tile_cement_01', namePt: 'Mosaico Hidráulico Azul', nameEs: 'Mosaico Hidráulico Azul', nameEn: 'Blue Hydraulic Tile', category: 'floor', supplier: 'Recer', tags: ['mosaico','hidráulico','padrão'], pbrMaps: {} },
  { id: randomUUID(), slug: 'tile_slate_01', namePt: 'Ardósia Natural', nameEs: 'Pizarra Natural', nameEn: 'Natural Slate', category: 'floor', supplier: 'Pavigrés', tags: ['pedra','ardósia','escuro'], pbrMaps: {} },
  { id: randomUUID(), slug: 'tile_limestone_01', namePt: 'Calcário Moleanos', nameEs: 'Caliza Moleanos', nameEn: 'Moleanos Limestone', category: 'floor', supplier: 'Pavigrés', tags: ['pedra','calcário','português'], pbrMaps: {} },
  // FLOORS — Other
  { id: randomUUID(), slug: 'floor_concrete_01', namePt: 'Betão Polido', nameEs: 'Hormigón Pulido', nameEn: 'Polished Concrete', category: 'floor', supplier: undefined, tags: ['betão','industrial','moderno'], pbrMaps: {} },
  { id: randomUUID(), slug: 'floor_vinyl_01', namePt: 'Vinílico Carvalho', nameEs: 'Vinilo Roble', nameEn: 'Vinyl Oak', category: 'floor', supplier: undefined, tags: ['vinílico','económico','prático'], pbrMaps: {} },
  { id: randomUUID(), slug: 'floor_cork_01', namePt: 'Cortiça Natural', nameEs: 'Corcho Natural', nameEn: 'Natural Cork', category: 'floor', supplier: 'Amorim', tags: ['cortiça','português','sustentável'], pbrMaps: {} },
  // WALLS — Paint
  { id: randomUUID(), slug: 'paint_white_01', namePt: 'Branco Neve', nameEs: 'Blanco Nieve', nameEn: 'Snow White', category: 'wall', supplier: 'CIN', tags: ['tinta','branco','mate'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_cream_01', namePt: 'Creme Natural', nameEs: 'Crema Natural', nameEn: 'Natural Cream', category: 'wall', supplier: 'CIN', tags: ['tinta','creme','quente'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_grey_01', namePt: 'Cinza Pérola', nameEs: 'Gris Perla', nameEn: 'Pearl Grey', category: 'wall', supplier: 'Robbialac', tags: ['tinta','cinza','moderno'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_blue_01', namePt: 'Azul Alentejo', nameEs: 'Azul Alentejo', nameEn: 'Alentejo Blue', category: 'wall', supplier: 'Tintas Barbot', tags: ['tinta','azul','tradicional'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_terracotta_01', namePt: 'Terracota Suave', nameEs: 'Terracota Suave', nameEn: 'Soft Terracotta', category: 'wall', supplier: 'Tintas Barbot', tags: ['tinta','terracota','quente'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_sage_01', namePt: 'Verde Salva', nameEs: 'Verde Salvia', nameEn: 'Sage Green', category: 'wall', supplier: 'CIN', tags: ['tinta','verde','natural'], pbrMaps: {} },
  { id: randomUUID(), slug: 'paint_charcoal_01', namePt: 'Carvão', nameEs: 'Carbón', nameEn: 'Charcoal', category: 'wall', supplier: 'Robbialac', tags: ['tinta','escuro','dramático'], pbrMaps: {} },
  // WALLS — Tiles
  { id: randomUUID(), slug: 'wall_azulejo_01', namePt: 'Azulejo Tradicional Azul', nameEs: 'Azulejo Tradicional Azul', nameEn: 'Traditional Blue Azulejo', category: 'wall', supplier: 'Recer', tags: ['azulejo','tradicional','português'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wall_azulejo_02', namePt: 'Azulejo Geométrico', nameEs: 'Azulejo Geométrico', nameEn: 'Geometric Azulejo', category: 'wall', supplier: 'Love Tiles', tags: ['azulejo','geométrico','moderno'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wall_metro_01', namePt: 'Metro Branco Biselado', nameEs: 'Metro Blanco Biselado', nameEn: 'Beveled White Metro', category: 'wall', supplier: 'Love Tiles', tags: ['metro','branco','cozinha'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wall_subway_01', namePt: 'Subway Verde', nameEs: 'Subway Verde', nameEn: 'Green Subway', category: 'wall', supplier: 'Love Tiles', tags: ['subway','verde','retro'], pbrMaps: {} },
  // WALLS — Stone/Brick
  { id: randomUUID(), slug: 'wall_brick_01', namePt: 'Tijolo Exposto', nameEs: 'Ladrillo Visto', nameEn: 'Exposed Brick', category: 'wall', supplier: undefined, tags: ['tijolo','rústico','industrial'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wall_stone_01', namePt: 'Pedra Natural Calcária', nameEs: 'Piedra Natural Caliza', nameEn: 'Natural Limestone Wall', category: 'wall', supplier: undefined, tags: ['pedra','natural','rústico'], pbrMaps: {} },
  // WALLS — Wallpaper/Panels
  { id: randomUUID(), slug: 'wall_panel_01', namePt: 'Painel Ripado Carvalho', nameEs: 'Panel Listones Roble', nameEn: 'Oak Slat Panel', category: 'wall', supplier: 'Sonae Arauco', tags: ['painel','madeira','contemporâneo'], pbrMaps: {} },
  { id: randomUUID(), slug: 'wall_stucco_01', namePt: 'Estuque Veneziano', nameEs: 'Estuco Veneciano', nameEn: 'Venetian Plaster', category: 'wall', supplier: undefined, tags: ['estuque','luxo','textura'], pbrMaps: {} },
  // COUNTERTOP
  { id: randomUUID(), slug: 'counter_granite_01', namePt: 'Granito Preto Zimbabwe', nameEs: 'Granito Negro Zimbabwe', nameEn: 'Zimbabwe Black Granite', category: 'countertop', supplier: undefined, tags: ['granito','preto','cozinha'], pbrMaps: {} },
  { id: randomUUID(), slug: 'counter_quartz_01', namePt: 'Quartzo Branco Carrara', nameEs: 'Cuarzo Blanco Carrara', nameEn: 'Carrara White Quartz', category: 'countertop', supplier: undefined, tags: ['quartzo','branco','elegante'], pbrMaps: {} },
  { id: randomUUID(), slug: 'counter_wood_01', namePt: 'Madeira Maciça Carvalho', nameEs: 'Madera Maciza Roble', nameEn: 'Solid Oak Wood', category: 'countertop', supplier: 'Sonae Arauco', tags: ['madeira','carvalho','natural'], pbrMaps: {} },
  { id: randomUUID(), slug: 'counter_marble_01', namePt: 'Mármore Estremoz Rosa', nameEs: 'Mármol Estremoz Rosa', nameEn: 'Estremoz Pink Marble', category: 'countertop', supplier: undefined, tags: ['mármore','rosa','português','premium'], pbrMaps: {} },
  // CEILING
  { id: randomUUID(), slug: 'ceiling_white_01', namePt: 'Gesso Liso Branco', nameEs: 'Yeso Liso Blanco', nameEn: 'Smooth White Plaster', category: 'ceiling', supplier: undefined, tags: ['gesso','branco','standard'], pbrMaps: {} },
  { id: randomUUID(), slug: 'ceiling_wood_01', namePt: 'Vigamento Madeira', nameEs: 'Vigas de Madera', nameEn: 'Exposed Wood Beams', category: 'ceiling', supplier: undefined, tags: ['madeira','rústico','vigas'], pbrMaps: {} },
  // DOORS
  { id: randomUUID(), slug: 'door_white_01', namePt: 'Porta Lacada Branca', nameEs: 'Puerta Lacada Blanca', nameEn: 'White Lacquered Door', category: 'door', supplier: undefined, tags: ['porta','branco','moderno'], pbrMaps: {} },
  { id: randomUUID(), slug: 'door_oak_01', namePt: 'Porta Carvalho Natural', nameEs: 'Puerta Roble Natural', nameEn: 'Natural Oak Door', category: 'door', supplier: 'Sonae Arauco', tags: ['porta','carvalho','clássico'], pbrMaps: {} },
  { id: randomUUID(), slug: 'door_glass_01', namePt: 'Porta Vidro Temperado', nameEs: 'Puerta Vidrio Templado', nameEn: 'Tempered Glass Door', category: 'door', supplier: undefined, tags: ['porta','vidro','moderno'], pbrMaps: {} },
  // WINDOWS
  { id: randomUUID(), slug: 'window_aluminium_01', namePt: 'Caixilharia Alumínio Lacado', nameEs: 'Carpintería Aluminio Lacado', nameEn: 'Lacquered Aluminium Frame', category: 'window', supplier: undefined, tags: ['janela','alumínio','moderno'], pbrMaps: {} },
  { id: randomUUID(), slug: 'window_pvc_01', namePt: 'Caixilharia PVC Branco', nameEs: 'Carpintería PVC Blanco', nameEn: 'White PVC Frame', category: 'window', supplier: undefined, tags: ['janela','pvc','económico'], pbrMaps: {} },
  { id: randomUUID(), slug: 'window_wood_01', namePt: 'Caixilharia Madeira Pintada', nameEs: 'Carpintería Madera Pintada', nameEn: 'Painted Wood Frame', category: 'window', supplier: undefined, tags: ['janela','madeira','tradicional'], pbrMaps: {} },
  // BATHROOM
  { id: randomUUID(), slug: 'bath_tile_01', namePt: 'Mosaico WC Branco 10x10', nameEs: 'Mosaico WC Blanco 10x10', nameEn: 'White Bathroom Mosaic 10x10', category: 'bathroom', supplier: 'Recer', tags: ['mosaico','wc','branco'], pbrMaps: {} },
  { id: randomUUID(), slug: 'bath_tile_02', namePt: 'Pastilha Hexagonal Cinza', nameEs: 'Pastilla Hexagonal Gris', nameEn: 'Grey Hex Tile', category: 'bathroom', supplier: 'Cinca', tags: ['pastilha','hexagonal','moderno'], pbrMaps: {} },
  // KITCHEN
  { id: randomUUID(), slug: 'kitchen_backsplash_01', namePt: 'Vidro Temperado Preto', nameEs: 'Vidrio Templado Negro', nameEn: 'Black Tempered Glass', category: 'kitchen', supplier: undefined, tags: ['cozinha','vidro','preto'], pbrMaps: {} },
  // EXTERIOR
  { id: randomUUID(), slug: 'ext_render_01', namePt: 'Reboco Branco', nameEs: 'Revoco Blanco', nameEn: 'White Render', category: 'exterior', supplier: undefined, tags: ['exterior','reboco','mediterrâneo'], pbrMaps: {} },
  { id: randomUUID(), slug: 'ext_tile_01', namePt: 'Azulejo Fachada Lisboa', nameEs: 'Azulejo Fachada Lisboa', nameEn: 'Lisbon Facade Azulejo', category: 'exterior', supplier: 'Recer', tags: ['exterior','azulejo','português'], pbrMaps: {} },
  { id: randomUUID(), slug: 'ext_stone_01', namePt: 'Lioz Abujardado', nameEs: 'Lioz Abujardado', nameEn: 'Bush-hammered Lioz', category: 'exterior', supplier: undefined, tags: ['exterior','pedra','lioz','português'], pbrMaps: {} },
  { id: randomUUID(), slug: 'ext_corten_01', namePt: 'Aço Corten', nameEs: 'Acero Corten', nameEn: 'Corten Steel', category: 'exterior', supplier: undefined, tags: ['exterior','metal','industrial'], pbrMaps: {} },
  { id: randomUUID(), slug: 'ext_wood_01', namePt: 'Ripado Cedro', nameEs: 'Listones Cedro', nameEn: 'Cedar Cladding', category: 'exterior', supplier: undefined, tags: ['exterior','madeira','natural'], pbrMaps: {} },
];
