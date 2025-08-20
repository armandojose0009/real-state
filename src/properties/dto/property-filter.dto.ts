import { IsOptional, IsNumber, IsString, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyFilterDto {
  @ApiPropertyOptional({ example: 'Downtown' })
  @IsOptional()
  @IsString({ message: 'Sector must be a string' })
  sector?: string;

  @ApiPropertyOptional({ example: 'Apartment' })
  @IsOptional()
  @IsString({ message: 'Property type must be a string' })
  propertyType?: string;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Min(0, { message: 'Minimum price cannot be negative' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Min(0, { message: 'Maximum price cannot be negative' })
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'Main Street' })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @ApiPropertyOptional({ example: 'valuation', enum: ['valuation', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt', 'createdAt'] })
  @IsOptional()
  @IsIn(['valuation', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt', 'createdAt'], { message: 'Sort field must be one of: valuation, bedrooms, bathrooms, squareFeet, yearBuilt, createdAt' })
  sort?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'Order must be ASC or DESC' })
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Offset must be a number' })
  @Min(0, { message: 'Offset cannot be negative' })
  offset?: number = 0;
}
