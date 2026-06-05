import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RefundsService } from './refunds.service';
import {
  CreateRefundDto,
  ListRefundsQueryDto,
  UpdateRefundDto,
} from './dto/refund.dto';

@Controller('refunds')
export class RefundsController {
  constructor(private refunds: RefundsService) {}

  @Get()
  list(@Query() query: ListRefundsQueryDto) {
    return this.refunds.list(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="refunds.csv"')
  exportCsv(@Query() query: ListRefundsQueryDto) {
    return this.refunds.exportCsv(query);
  }

  @Get('refundable/:orderId')
  refundable(@Param('orderId') orderId: string) {
    return this.refunds.refundableForOrder(orderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refunds.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRefundDto) {
    return this.refunds.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRefundDto) {
    return this.refunds.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.refunds.remove(id);
  }
}
