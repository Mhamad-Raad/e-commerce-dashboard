import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class SetFeaturedDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}
