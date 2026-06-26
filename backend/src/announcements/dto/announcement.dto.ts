import { AnnouncementAudience, HomeTargetType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListAnnouncementsQueryDto extends PaginationQueryDto {}

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(140)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  titleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  titleCkb?: string;

  @IsString()
  @MaxLength(2000)
  bodyEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bodyAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bodyCkb?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  // Tappable deep-link target (reuses HomeTargetType). Validated in the service.
  @IsOptional()
  @IsEnum(HomeTargetType)
  targetType?: HomeTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  url?: string;

  // ALL = broadcast to every active customer; SINGLE = the chosen customerIds.
  @IsEnum(AnnouncementAudience)
  audience!: AnnouncementAudience;

  // One or more recipients when audience = SINGLE.
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  customerIds?: string[];
}
