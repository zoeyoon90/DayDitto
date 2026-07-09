import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TranslateController],
  providers: [TranslateService],
})
export class TranslateModule {}
