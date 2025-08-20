import { PaginationResponse } from '../dto/pagination-response.dto';

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
): PaginationResponse<T> {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      totalPages,
      currentPage,
      limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
    },
  };
}