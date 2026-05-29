import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CartStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListCartsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @IsOptional()
  @IsString()
  customerId?: string;
}
