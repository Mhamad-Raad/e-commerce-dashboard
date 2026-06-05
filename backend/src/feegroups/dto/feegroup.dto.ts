import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { IsBooleanString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateFeeGroupDto {
  @IsString()
  @Length(1, 60)
  name!: string;

  @IsString()
  @Length(1, 40)
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  feeCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  taxRatePct?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFeeGroupDto extends PartialType(CreateFeeGroupDto) {}

export class ListFeeGroupsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
