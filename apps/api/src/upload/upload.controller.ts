import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface AuthUser {
  id: string;
}

@Controller('upload')
@UseGuards(JwtGuard)
export class UploadController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const adminSupabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const ext = file.originalname.split('.').pop();
    const path = `${req.user.id}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await adminSupabase.storage
      .from('diary-images')
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) throw new InternalServerErrorException(error.message);

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('diary-images').getPublicUrl(data.path);

    return { url: publicUrl };
  }
}
