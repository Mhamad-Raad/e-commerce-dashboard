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
import { CreateStoreDto } from './dto/create-store.dto';
import { ListStoresQueryDto } from './dto/list-stores.query.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private stores: StoresService) {}

  @Get()
  list(@Query() query: ListStoresQueryDto) {
    return this.stores.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stores.findById(id);
  }

  @Post()
  create(@Body() dto: CreateStoreDto) {
    return this.stores.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.stores.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.stores.remove(id);
  }
}
