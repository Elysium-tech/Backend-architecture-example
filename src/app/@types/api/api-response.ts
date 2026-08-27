export interface ApiResponseSuccess<T> {
  success: true;
  status: number;
  message: string;
  body: T;
}

export interface ApiResponseError<E = unknown> {
  success: false;
  status: number;
  message: string;
  error: E;
}

export type ApiResponse<T, E = unknown> =
  | ApiResponseSuccess<T>
  | ApiResponseError<E>;
