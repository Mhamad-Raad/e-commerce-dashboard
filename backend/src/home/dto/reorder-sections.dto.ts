import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderEntryDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  position!: number;
}

export class ReorderSectionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryDto)
  sections!: ReorderEntryDto[];
}
