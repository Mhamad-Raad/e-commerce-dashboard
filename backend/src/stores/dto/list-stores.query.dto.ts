import { IsBooleanString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListStoresQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
