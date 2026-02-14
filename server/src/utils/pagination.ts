import { PaginationQuery, PaginationInfo } from '../types';

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const sort = query.sort || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;

  return { page, limit, skip, sort, order };
};

export const getPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

// Sanitize sort field to prevent injection
const ALLOWED_SORT_FIELDS = [
  'createdAt', 'updatedAt', 'name', 'price', 'salePrice',
  'rating', 'reviewCount', 'stock', 'sortOrder', 'total',
  'orderNumber', 'status',
];

export const sanitizeSortField = (field: string): string => {
  return ALLOWED_SORT_FIELDS.includes(field) ? field : 'createdAt';
};
