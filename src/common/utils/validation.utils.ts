import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class ValidationUtils {
  static async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      const message = errors
        .map((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        )
        .flat()
        .join(', ');
      throw new BadRequestException(message);
    }
  }
}
