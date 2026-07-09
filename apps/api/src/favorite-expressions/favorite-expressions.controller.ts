import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteExpressionsService } from './favorite-expressions.service';

interface AuthUser {
  id: string;
  email: string;
}

@Controller('favorite-expressions')
@UseGuards(JwtGuard)
export class FavoriteExpressionsController {
  constructor(
    private readonly favoriteExpressionsService: FavoriteExpressionsService,
  ) {}

  @Get()
  findAll(
    @Req() req: Request & { user: AuthUser },
    @Query('dailyLogId') dailyLogId?: string,
  ) {
    return this.favoriteExpressionsService.findAll(req.user.id, dailyLogId);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoriteExpressionsService.create(req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ) {
    await this.favoriteExpressionsService.remove(req.user.id, id);
  }

  @Patch(':id/audio')
  updateAudio(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
    @Body() body: { audioUrl: string },
  ) {
    return this.favoriteExpressionsService.updateAudioUrl(
      req.user.id,
      id,
      body.audioUrl,
    );
  }
}
