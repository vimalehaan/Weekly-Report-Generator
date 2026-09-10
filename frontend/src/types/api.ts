export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
  };
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiPaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
