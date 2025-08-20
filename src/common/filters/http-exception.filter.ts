import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      
      if (Array.isArray(exceptionResponse)) {
        errorResponse.message = 'Validation failed';
        errorResponse.errors = this.formatValidationErrors(exceptionResponse);
      } else if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        errorResponse.message = 'Validation failed';
        errorResponse.errors = this.formatValidationErrors(exceptionResponse.message);
      } else {
        errorResponse.message = exceptionResponse.message || exception.message;
      }
    } else {
      errorResponse.message = exception.message;
    }

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map(error => {
      if (error.constraints) {
        return {
          field: error.property,
          value: error.value,
          messages: Object.values(error.constraints)
        };
      }
      return error;
    });
  }
}
