import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('gif')
@UseGuards(JwtGuard)
export class GifController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getGifs(@Query('q') q?: string) {
    const key = this.configService.get<string>('KLIPY_API_KEY');
    const base = `https://api.klipy.com/api/v1/${key}/gifs`;
    const url = q
      ? `${base}/search?q=${encodeURIComponent(q)}&per_page=24`
      : `${base}/trending?per_page=24`;

    const res = await fetch(url);
    return res.json();
  }
}
