import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDate()
  @IsNotEmpty()
  listedAt: Date;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;

  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
