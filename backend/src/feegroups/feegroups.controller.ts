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
import { FeeGroupsService } from './feegroups.service';
import {
  CreateFeeGroupDto,
  ListFeeGroupsQueryDto,
  UpdateFeeGroupDto,
} from './dto/feegroup.dto';

@Controller('fee-groups')
export class FeeGroupsController {
  constructor(private feeGroups: FeeGroupsService) {}

  @Get()
  list(@Query() query: ListFeeGroupsQueryDto) {
    return this.feeGroups.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feeGroups.findById(id);
  }

  @Post()
  create(@Body() dto: CreateFeeGroupDto) {
    return this.feeGroups.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeeGroupDto) {
    return this.feeGroups.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.feeGroups.remove(id);
  }
}
