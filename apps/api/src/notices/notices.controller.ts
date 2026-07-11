import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { NoticesService } from './notices.service';

@Controller('notices')
@UseGuards(JwtGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get('active')
  getActive() {
    return this.noticesService.getActive();
  }
}
