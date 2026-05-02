export interface PageResult<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}
