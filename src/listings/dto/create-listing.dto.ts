import { IsNotEmpty, IsString, IsNumber, IsDateString, IsUUID, IsIn, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({ example: 'Beautiful Downtown Apartment' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'Modern 2-bedroom apartment with great amenities' })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ example: 2500 })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'sold', 'rented'] })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['active', 'inactive', 'sold', 'rented'], { message: 'Status must be one of: active, inactive, sold, rented' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString({}, { message: 'Listed date must be a valid ISO date string' })
  @Transform(({ value }) => new Date(value))
  listedAt: Date;

  @ApiProperty({ example: '2024-07-15T10:00:00Z' })
  @IsDateString({}, { message: 'Expiration date must be a valid ISO date string' })
  @Transform(({ value }) => new Date(value))
  expiresAt: Date;

  @ApiProperty({ example: 'uuid-property-id' })
  @IsUUID(4, { message: 'Property ID must be a valid UUID' })
  propertyId: string;

  @IsOptional()
  tenantId?: string;
}
