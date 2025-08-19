import { IsOptional, IsNumber, IsString } from 'class-validator';

export class PropertyFilterDto {
  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}
