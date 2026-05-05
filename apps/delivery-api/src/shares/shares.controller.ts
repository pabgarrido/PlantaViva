import { Controller, Get, Param } from '@nestjs/common';

@Controller('shares')
export class SharesController {
  /** GET /api/v1/shares/:token — public share viewer endpoint */
  @Get(':token')
  getShare(@Param('token') token: string) {
    // TODO Phase 6: validate JWT share token, return gallery + renders
    return { token, status: 'coming_soon' };
  }
}
