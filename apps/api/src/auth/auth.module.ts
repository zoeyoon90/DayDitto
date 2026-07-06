import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [JwtGuard],
  exports: [JwtGuard],
})
export class AuthModule {}
