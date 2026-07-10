import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

interface AuthUser {
  id: string;
  email: string;
  nickname?: string;
  provider: string;
}

@Controller('inquiries')
@UseGuards(JwtGuard)
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateInquiryDto,
  ) {
    return this.inquiriesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: Request & { user: AuthUser }) {
    return this.inquiriesService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ) {
    return this.inquiriesService.findOne(req.user.id, id);
  }
}
