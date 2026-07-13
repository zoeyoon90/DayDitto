import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FavoriteExpressionsController } from './favorite-expressions.controller';
import { FavoriteExpressionsService } from './favorite-expressions.service';

@Module({
  imports: [AuthModule],
  controllers: [FavoriteExpressionsController],
  providers: [FavoriteExpressionsService],
  exports: [FavoriteExpressionsService],
})
export class FavoriteExpressionsModule {}
