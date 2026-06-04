import { City, Governorate } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  label?: string;

  @IsEnum(Governorate)
  governorate!: Governorate;

  @IsEnum(City)
  city!: City;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  district?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  street?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  nearestLandmark?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  label?: string;

  @IsOptional()
  @IsEnum(Governorate)
  governorate?: Governorate;

  @IsOptional()
  @IsEnum(City)
  city?: City;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  district?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  street?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  nearestLandmark?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
