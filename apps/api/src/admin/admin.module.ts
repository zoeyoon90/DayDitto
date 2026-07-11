import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { NoticesModule } from '../notices/notices.module';

@Module({
  imports: [AuthModule, NoticesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
