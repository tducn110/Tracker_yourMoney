// apps/api/src/lib/response.ts
// Standardized API response builders — consistent JSON format
import { Context } from "hono";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page?: number; total?: number; limit?: number };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export const ok = <T>(c: Context, data: T, meta?: ApiSuccess<T>["meta"]) =>
  c.json<ApiSuccess<T>>({ success: true, data, ...(meta && { meta }) }, 200);

export const created = <T>(c: Context, data: T) =>
  c.json<ApiSuccess<T>>({ success: true, data }, 201);

export const err = (c: Context, status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500, code: string, message: string, details?: unknown) =>
  c.json<ApiError>({ 
    success: false, 
    error: { 
      code, 
      message, 
      ...(details !== undefined ? { details } : {}) 
    } 
  }, status);
