import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private blog: BlogService) {}

  // Public: published posts only. Static routes are declared before ':id'.
  @Public()
  @Get()
  listPublished() {
    return this.blog.listPublished();
  }

  // Admin: all posts incl. drafts (behind the global JwtAuthGuard).
  @Get('admin')
  listAll() {
    return this.blog.listAll();
  }

  @Get('admin/:id')
  getOne(@Param('id') id: string) {
    return this.blog.getOne(id);
  }

  @Public()
  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.blog.getPublished(id);
  }

  @Post()
  create(@Body() dto: CreateBlogDto) {
    return this.blog.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blog.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.blog.remove(id);
  }
}
