import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TranslateService } from './translate.service';

@Controller('translate')
@UseGuards(JwtGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async translate(@Body() body: { lines: string[] }) {
    const translations = await this.translateService.translate(
      body.lines ?? [],
    );
    return { translations };
  }
}
