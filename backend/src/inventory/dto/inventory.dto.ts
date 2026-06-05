import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotIn,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class RestockDto {
  @IsString()
  @Length(1, 40)
  productId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

export class AdjustStockDto {
  @IsString()
  @Length(1, 40)
  productId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  variantId?: string;

  // Signed correction: positive adds, negative removes. Never zero.
  @IsInt()
  @IsNotIn([0])
  delta!: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}

export class ListMovementsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}
