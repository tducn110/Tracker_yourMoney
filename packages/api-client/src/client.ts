import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' : 'http://localhost:3001';
const API_TIMEOUT = 15000;

/**
 * API Client - Shared Logic
 */

const isObject = (o: any): o is Record<string, any> => 
  o !== null && 
  typeof o === 'object' && 
  !(o instanceof Date) && 
  !(o instanceof RegExp) &&
  !(o instanceof Blob) &&
  !(o instanceof File);

export const toCamel = (o: any, seen = new WeakSet()): any => {
  if (!isObject(o)) return o;
  if (seen.has(o)) return o; // Circular reference guard
  seen.add(o);

  if (Array.isArray(o)) return o.map(i => toCamel(i, seen));

  const n: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    const ck = k.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
    n[ck] = toCamel(v, seen);
  }
  return n;
};

export const toSnake = (o: any, seen = new WeakSet()): any => {
  if (!isObject(o)) return o;
  if (seen.has(o)) return o;
  seen.add(o);

  if (Array.isArray(o)) return o.map(i => toSnake(i, seen));

  const n: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    const sk = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    n[sk] = toSnake(v, seen);
  }
  return n;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound Interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // ── CORRELATION ID INJECTION ─────────────────────────────────────
  // Generate a unique ID for distributed tracing (Single Source of Truth)
  const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
    
  config.headers['x-correlation-id'] = correlationId;

  if (config.data && !(config.data instanceof FormData)) {
    config.data = toSnake(config.data);
  }
  if (config.params) {
    config.params = toSnake(config.params);
  }
  return config;
});

// Inbound Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = toCamel(response.data);
    // Automatically unwrap the standard response envelope
    if (data && typeof data === 'object' && data.success === true && data.data !== undefined) {
      return data.data;
    }
    return data;
  },
  (error: any) => {
    const message = error.response?.data?.error?.message || error.message || 'Unknown API Error';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
