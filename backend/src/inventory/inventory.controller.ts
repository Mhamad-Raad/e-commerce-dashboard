import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  AdjustStockDto,
  ListMovementsQueryDto,
  RestockDto,
} from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get('low-stock')
  lowStock() {
    return this.inventory.lowStock();
  }

  @Get('movements')
  movements(@Query() query: ListMovementsQueryDto) {
    return this.inventory.listMovements(query);
  }

  @Post('restock')
  @HttpCode(HttpStatus.OK)
  restock(@Body() dto: RestockDto) {
    return this.inventory.restock(dto);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  adjust(@Body() dto: AdjustStockDto) {
    return this.inventory.adjust(dto);
  }
}
