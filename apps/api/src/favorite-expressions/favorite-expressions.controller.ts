import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  constructor(private readonly favoriteExpressionsService: FavoriteExpressionsService) {}

  @Get()
  findAll(@Req() req: Request & { user: AuthUser }) {
    return this.favoriteExpressionsService.findAll(req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoriteExpressionsService.create(req.user.id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.favoriteExpressionsService.remove(req.user.id, id);
  }
}
