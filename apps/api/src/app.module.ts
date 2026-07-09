import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { FavoriteExpressionsModule } from './favorite-expressions/favorite-expressions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    DailyLogsModule,
    FavoriteExpressionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
