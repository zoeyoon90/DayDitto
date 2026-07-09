import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { DailyLogsModule } from '../daily-logs/daily-logs.module';
import { FavoriteExpressionsModule } from '../favorite-expressions/favorite-expressions.module';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';

@Module({
  imports: [ConfigModule, AuthModule, DailyLogsModule, FavoriteExpressionsModule],
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}
