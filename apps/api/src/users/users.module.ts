import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [UsersController],
})
export class UsersModule {}
