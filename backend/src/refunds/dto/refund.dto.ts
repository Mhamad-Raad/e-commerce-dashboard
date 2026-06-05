import { RefundReason, RefundStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class RefundItemInputDto {
  @IsString()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateRefundDto {
  @IsString()
  orderId!: string;

  @IsEnum(RefundReason)
  reason!: RefundReason;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  note?: string;

  @IsOptional()
  @IsBoolean()
  restock?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundItemInputDto)
  items!: RefundItemInputDto[];

  // Optional override of the computed amount (defaults to the items' value).
  @IsOptional()
  @IsInt()
  @Min(0)
  amountCents?: number;
}

// Status moves anytime (with transition rules); reason/note/restock/amount are
// only honoured while the refund is still REQUESTED (enforced in the service).
export class UpdateRefundDto {
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  note?: string;

  @IsOptional()
  @IsBoolean()
  restock?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountCents?: number;
}

export class ListRefundsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @IsOptional()
  @IsString()
  orderId?: string;
}
