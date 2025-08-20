import { createPaginationResponse } from './pagination.util';

describe('PaginationUtil', () => {
  describe('createPaginationResponse', () => {
    it('should create pagination response for first page', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 25;
      const limit = 10;
      const offset = 0;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data,
        pagination: {
          total: 25,
          totalPages: 3,
          currentPage: 1,
          limit: 10,
          hasNext: true,
          hasPrev: false,
          nextPage: 2,
          prevPage: null,
        },
      });
    });

    it('should create pagination response for middle page', () => {
      const data = [{ id: 11 }, { id: 12 }, { id: 13 }];
      const total = 25;
      const limit = 10;
      const offset = 10;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data,
        pagination: {
          total: 25,
          totalPages: 3,
          currentPage: 2,
          limit: 10,
          hasNext: true,
          hasPrev: true,
          nextPage: 3,
          prevPage: 1,
        },
      });
    });

    it('should create pagination response for last page', () => {
      const data = [{ id: 21 }, { id: 22 }, { id: 23 }];
      const total = 25;
      const limit = 10;
      const offset = 20;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data,
        pagination: {
          total: 25,
          totalPages: 3,
          currentPage: 3,
          limit: 10,
          hasNext: false,
          hasPrev: true,
          nextPage: null,
          prevPage: 2,
        },
      });
    });

    it('should handle single page result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const total = 2;
      const limit = 10;
      const offset = 0;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data,
        pagination: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
        },
      });
    });

    it('should handle empty result', () => {
      const data = [];
      const total = 0;
      const limit = 10;
      const offset = 0;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
        },
      });
    });

    it('should handle different limit sizes', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
      const total = 23;
      const limit = 5;
      const offset = 5;

      const result = createPaginationResponse(data, total, limit, offset);

      expect(result).toEqual({
        data,
        pagination: {
          total: 23,
          totalPages: 5,
          currentPage: 2,
          limit: 5,
          hasNext: true,
          hasPrev: true,
          nextPage: 3,
          prevPage: 1,
        },
      });
    });
  });
});