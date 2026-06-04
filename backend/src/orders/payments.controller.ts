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
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@Controller('orders/:orderId/payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  list(@Param('orderId') orderId: string) {
    return this.payments.list(orderId);
  }

  @Post()
  create(@Param('orderId') orderId: string, @Body() dto: CreatePaymentDto) {
    return this.payments.create(orderId, dto);
  }

  @Patch(':id')
  update(
    @Param('orderId') orderId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.payments.update(orderId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('orderId') orderId: string, @Param('id') id: string) {
    return this.payments.remove(orderId, id);
  }
}
