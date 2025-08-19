import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @IsNotEmpty()
  transactionDate: Date;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  tenantId?: string;
}
