export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(message: string, statusCode: number = 500): ApiResponse {
  return {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

export function formatApiResponse<T>(
  data: T,
  message: string,
  success: boolean = true,
  statusCode?: number,
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (!success && statusCode) {
    response.statusCode = statusCode;
  }

  return response;
}