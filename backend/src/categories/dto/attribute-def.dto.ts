import { IsArray, IsIn, IsOptional, IsString, Length } from 'class-validator';

export const ATTRIBUTE_TYPES = [
  'text',
  'textarea',
  'number',
  'select',
  'multiselect',
] as const;

export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

/** One attribute definition in a category's schema. */
export class AttributeDefDto {
  // Stable machine key used in Product.attributes (e.g. "skinType").
  @IsString()
  @Length(1, 40)
  key!: string;

  // Human label shown in the dashboard form (e.g. "Skin type").
  @IsString()
  @Length(1, 60)
  label!: string;

  @IsIn(ATTRIBUTE_TYPES)
  type!: AttributeType;

  // Choices for select / multiselect types; ignored for the others.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}
