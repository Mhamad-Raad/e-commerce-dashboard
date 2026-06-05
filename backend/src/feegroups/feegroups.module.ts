import { Module } from '@nestjs/common';
import { FeeGroupsController } from './feegroups.controller';
import { FeeGroupsService } from './feegroups.service';

@Module({
  controllers: [FeeGroupsController],
  providers: [FeeGroupsService],
  exports: [FeeGroupsService],
})
export class FeeGroupsModule {}
