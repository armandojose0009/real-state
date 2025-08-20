import { IsNotEmpty, IsString, IsNumber, IsObject, ValidateNested, IsArray, IsIn, IsPositive, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { Point } from 'geojson';

class PointDto {
  @ApiProperty({ example: 'Point' })
  @IsString({ message: 'Location type must be a string' })
  @IsIn(['Point'], { message: 'Location type must be "Point"' })
  type: 'Point';

  @ApiProperty({ example: [-80.1918, 25.7617], description: 'Longitude and Latitude coordinates' })
  @IsArray({ message: 'Coordinates must be an array' })
  @IsNumber({}, { each: true, message: 'Each coordinate must be a number' })
  coordinates: [number, number];
}

export class CreatePropertyDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({ example: 'Miami' })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({ example: 'FL' })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @ApiProperty({ example: '33101' })
  @IsString({ message: 'Zip code must be a string' })
  @IsNotEmpty({ message: 'Zip code is required' })
  zipCode: string;

  @ApiProperty({ example: 'Downtown' })
  @IsString({ message: 'Sector must be a string' })
  @IsNotEmpty({ message: 'Sector is required' })
  sector: string;

  @ApiProperty({ example: 'Apartment' })
  @IsString({ message: 'Property type must be a string' })
  @IsNotEmpty({ message: 'Property type is required' })
  propertyType: string;

  @ApiProperty({ 
    example: { type: 'Point', coordinates: [-80.1918, 25.7617] },
    description: 'GeoJSON Point with longitude and latitude'
  })
  @IsObject({ message: 'Location must be a valid GeoJSON Point object' })
  @ValidateNested({ message: 'Location structure is invalid' })
  @Type(() => PointDto)
  location: Point;

  @ApiProperty({ example: 350000 })
  @IsNumber({}, { message: 'Valuation must be a number' })
  @IsPositive({ message: 'Valuation must be a positive number' })
  valuation: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Bedrooms must be an integer' })
  @Min(0, { message: 'Bedrooms cannot be negative' })
  @Max(20, { message: 'Bedrooms cannot exceed 20' })
  bedrooms: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Bathrooms must be an integer' })
  @Min(0, { message: 'Bathrooms cannot be negative' })
  @Max(20, { message: 'Bathrooms cannot exceed 20' })
  bathrooms: number;

  @ApiProperty({ example: 1200 })
  @IsInt({ message: 'Square feet must be an integer' })
  @IsPositive({ message: 'Square feet must be a positive number' })
  squareFeet: number;

  @ApiProperty({ example: 2020 })
  @IsInt({ message: 'Year built must be an integer' })
  @Min(1800, { message: 'Year built cannot be before 1800' })
  @Max(new Date().getFullYear() + 5, { message: `Year built cannot be more than ${new Date().getFullYear() + 5}` })
  yearBuilt: number;

  @ApiProperty({ example: '6d14f2b4-77d4-476c-83a5-1e1c49498e40', required: false })
  @IsOptional()
  @IsUUID(4, { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;
}
