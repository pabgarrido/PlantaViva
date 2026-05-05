import { Controller, Get, UseGuards } from '@nestjs/common';
import { B2CAuthGuard } from './b2c-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(B2CAuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return {
      sub: user.sub,
      email: user.email,
      name: user.name,
    };
  }
}
