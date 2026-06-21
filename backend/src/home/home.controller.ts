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
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import { CreateSectionDto } from './dto/create-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private home: HomeService) {}

  // Public storefront layout — ordered active sections with resolved items.
  @Public()
  @Get('layout')
  getLayout(@Query('lang') lang?: string) {
    return this.home.getLayout(toLang(lang));
  }

  // ── Admin builder (behind the global JwtAuthGuard) ──────────────────────────
  @Get('sections')
  listSections() {
    return this.home.listSections();
  }

  @Post('sections')
  createSection(@Body() dto: CreateSectionDto) {
    return this.home.createSection(dto);
  }

  // Declared before ':id' so "reorder" isn't captured as an id.
  @Patch('sections/reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() dto: ReorderSectionsDto) {
    return this.home.reorder(dto.sections);
  }

  @Patch('sections/:id')
  updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.home.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  removeSection(@Param('id') id: string) {
    return this.home.removeSection(id);
  }
}
