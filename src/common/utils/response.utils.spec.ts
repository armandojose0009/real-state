import { createSuccessResponse, createErrorResponse, formatApiResponse } from './response.utils';

describe('ResponseUtils', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data, 'Success message');

      expect(response).toEqual({
        success: true,
        message: 'Success message',
        data,
        timestamp: expect.any(String),
      });
    });

    it('should create success response without message', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBeUndefined();
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse('Error message', 400);

      expect(response).toEqual({
        success: false,
        message: 'Error message',
        statusCode: 400,
        timestamp: expect.any(String),
      });
    });

    it('should create error response with default status code', () => {
      const response = createErrorResponse('Error message');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('formatApiResponse', () => {
    it('should format API response consistently', () => {
      const data = { users: [{ id: 1, name: 'John' }] };
      const response = formatApiResponse(data, 'Users retrieved', true);

      expect(response).toEqual({
        success: true,
        message: 'Users retrieved',
        data,
        timestamp: expect.any(String),
      });
    });

    it('should format error response', () => {
      const response = formatApiResponse(null, 'Not found', false, 404);

      expect(response).toEqual({
        success: false,
        message: 'Not found',
        data: null,
        statusCode: 404,
        timestamp: expect.any(String),
      });
    });
  });
});