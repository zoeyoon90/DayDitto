import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { FavoriteExpressionsModule } from './favorite-expressions/favorite-expressions.module';
import { TranslateModule } from './translate/translate.module';
import { TtsModule } from './tts/tts.module';
import { GifModule } from './gif/gif.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    DailyLogsModule,
    FavoriteExpressionsModule,
    TranslateModule,
    TtsModule,
    GifModule,
    UploadModule,
    UsersModule,
    InquiriesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
