import { IsOptional, IsNumber, IsString, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListingFilterDto {
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'sold', 'rented'] })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['active', 'inactive', 'sold', 'rented'], { message: 'Status must be one of: active, inactive, sold, rented' })
  status?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Min(0, { message: 'Minimum price cannot be negative' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Min(0, { message: 'Maximum price cannot be negative' })
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'apartment' })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @ApiPropertyOptional({ example: 'price', enum: ['price', 'title', 'listedAt', 'expiresAt'] })
  @IsOptional()
  @IsIn(['price', 'title', 'listedAt', 'expiresAt'], { message: 'Sort field must be one of: price, title, listedAt, expiresAt' })
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