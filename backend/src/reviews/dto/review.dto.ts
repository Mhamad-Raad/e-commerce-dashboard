import {
  IsBoolean,
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateReviewDto {
  @IsString()
  productId!: string;

  @IsString()
  customerId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class ListReviewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  approved?: string;

  @IsOptional()
  @IsString()
  productId?: string;
}
