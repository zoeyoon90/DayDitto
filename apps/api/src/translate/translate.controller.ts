import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TranslateService } from './translate.service';

@Controller('translate')
@UseGuards(JwtGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async translate(
    @Req() req: Request & { user: { id: string } },
    @Body() body: { lines: string[] },
  ) {
    const translations = await this.translateService.translate(
      req.user.id,
      body.lines ?? [],
    );
    return { translations };
  }
}
