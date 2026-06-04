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
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';
import { VariantsService } from './variants.service';

@Controller('products/:productId/variants')
export class VariantsController {
  constructor(private variants: VariantsService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.variants.list(productId);
  }

  @Post()
  create(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.variants.create(productId, dto);
  }

  @Patch(':id')
  update(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variants.update(productId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('productId') productId: string, @Param('id') id: string) {
    return this.variants.remove(productId, id);
  }
}
