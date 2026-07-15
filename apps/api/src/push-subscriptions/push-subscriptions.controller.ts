import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { SaveSubscriptionDto } from './dto/save-subscription.dto';

interface AuthUser {
  id: string;
}

@Controller('push-subscriptions')
@UseGuards(JwtGuard)
export class PushSubscriptionsController {
  constructor(private readonly service: PushSubscriptionsService) {}

  @Post()
  save(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: SaveSubscriptionDto,
  ) {
    return this.service.save(req.user.id, dto);
  }

  @Delete()
  remove(@Body('endpoint') endpoint: string) {
    return this.service.remove(endpoint);
  }
}
