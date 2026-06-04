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
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('customers/:customerId/addresses')
export class AddressesController {
  constructor(private addresses: AddressesService) {}

  @Get()
  list(@Param('customerId') customerId: string) {
    return this.addresses.list(customerId);
  }

  @Post()
  create(@Param('customerId') customerId: string, @Body() dto: CreateAddressDto) {
    return this.addresses.create(customerId, dto);
  }

  @Patch(':id')
  update(
    @Param('customerId') customerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addresses.update(customerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('customerId') customerId: string, @Param('id') id: string) {
    return this.addresses.remove(customerId, id);
  }
}
