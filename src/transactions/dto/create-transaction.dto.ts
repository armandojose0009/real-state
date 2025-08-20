import { IsNotEmpty, IsString, IsNumber, IsDateString, IsUUID, IsIn, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'sale', enum: ['sale', 'rent', 'commission', 'maintenance'] })
  @IsString({ message: 'Transaction type must be a string' })
  @IsIn(['sale', 'rent', 'commission', 'maintenance'], { message: 'Transaction type must be one of: sale, rent, commission, maintenance' })
  type: string;

  @ApiProperty({ example: 350000 })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @ApiProperty({ example: '2024-01-15T14:30:00Z' })
  @IsDateString({}, { message: 'Transaction date must be a valid ISO date string' })
  @Transform(({ value }) => new Date(value))
  transactionDate: Date;

  @ApiProperty({ example: 'Property sale transaction', required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 'uuid-property-id' })
  @IsUUID(4, { message: 'Property ID must be a valid UUID' })
  propertyId: string;

  @IsOptional()
  tenantId?: string;
}
