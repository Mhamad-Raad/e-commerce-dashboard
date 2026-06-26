import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  ListAnnouncementsQueryDto,
} from './dto/announcement.dto';

// Admin-only (inherits the global JwtAuthGuard — no @Public()). Lets staff
// compose and send a customer notification (broadcast or direct) immediately.
@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcements: AnnouncementsService) {}

  @Get()
  list(@Query() query: ListAnnouncementsQueryDto) {
    return this.announcements.list(query);
  }

  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcements.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.announcements.remove(id);
  }
}
