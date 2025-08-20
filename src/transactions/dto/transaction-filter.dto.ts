import { IsOptional, IsNumber, IsString, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionFilterDto {
  @ApiPropertyOptional({ example: 'sale', enum: ['sale', 'rent', 'commission', 'maintenance'] })
  @IsOptional()
  @IsString({ message: 'Transaction type must be a string' })
  @IsIn(['sale', 'rent', 'commission', 'maintenance'], { message: 'Transaction type must be one of: sale, rent, commission, maintenance' })
  type?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum amount must be a number' })
  @Min(0, { message: 'Minimum amount cannot be negative' })
  minAmount?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum amount must be a number' })
  @Min(0, { message: 'Maximum amount cannot be negative' })
  maxAmount?: number;

  @ApiPropertyOptional({ example: 'property' })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @ApiPropertyOptional({ example: 'amount', enum: ['amount', 'type', 'transactionDate'] })
  @IsOptional()
  @IsIn(['amount', 'type', 'transactionDate'], { message: 'Sort field must be one of: amount, type, transactionDate' })
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