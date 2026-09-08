import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [JwtGuard, AuthService],
  exports: [JwtGuard],
})
export class AuthModule {}
