import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdempotencyKeyDto {
  @ApiProperty({
    description: 'Unique key to ensure idempotent requests',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}
