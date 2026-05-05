import { Module, Global } from '@nestjs/common';
import { B2CAuthGuard } from './b2c-auth.guard';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [B2CAuthGuard],
  exports: [B2CAuthGuard],
})
export class AuthModule {}
