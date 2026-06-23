import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { AppAddressesController } from './app-addresses.controller';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [CustomersController, AddressesController, AppAddressesController],
  providers: [CustomersService, AddressesService],
})
export class CustomersModule {}
