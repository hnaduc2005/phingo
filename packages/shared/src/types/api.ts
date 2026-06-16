export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
