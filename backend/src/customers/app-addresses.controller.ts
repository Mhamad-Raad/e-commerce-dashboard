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
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

// Mobile customer addresses. Unlike the admin AddressesController (which trusts a
// `customerId` URL param), this is scoped to the authenticated customer via the
// customer JWT — a customer can only ever read/write their OWN addresses.
// @Public() so the global admin JwtAuthGuard skips it; CustomerJwtGuard runs.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/addresses')
export class AppAddressesController {
  constructor(private addresses: AddressesService) {}

  @Get()
  list(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.addresses.list(customer.id);
  }

  @Post()
  create(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addresses.create(customer.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addresses.update(customer.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.addresses.remove(customer.id, id);
  }
}
