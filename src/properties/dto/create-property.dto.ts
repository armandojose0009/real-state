import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import type { Point } from 'geojson';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  sector: string;

  @IsString()
  @IsNotEmpty()
  propertyType: string;

  @IsArray()
  @IsNotEmpty()
  location: Point;

  @IsNumber()
  @IsNotEmpty()
  valuation: number;

  @IsNumber()
  @IsNotEmpty()
  bedrooms: number;

  @IsNumber()
  @IsNotEmpty()
  bathrooms: number;

  @IsNumber()
  @IsNotEmpty()
  squareFeet: number;

  @IsNumber()
  @IsNotEmpty()
  yearBuilt: number;

  @IsString()
  tenantId?: string;
}
