import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { GifController } from './gif.controller';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [GifController],
})
export class GifModule {}
