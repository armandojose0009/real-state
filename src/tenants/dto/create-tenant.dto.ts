import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/user-role.enum';

export class CreateTenantDto {
  @ApiProperty({ example: 'Real Estate Company' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'contact@realestate.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  })
  password: string;

  @ApiProperty({ example: 'ADMIN', enum: UserRole })
  @IsEnum(UserRole, { message: 'Role must be a valid user role (USER or ADMIN)' })
  role: UserRole;
}
