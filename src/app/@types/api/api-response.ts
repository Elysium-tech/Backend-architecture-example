export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function created<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function noContent(): ApiResponse {
  return { success: true };
}
