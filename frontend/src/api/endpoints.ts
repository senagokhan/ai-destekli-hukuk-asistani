// API Endpoints
export const AUTH = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const;

export const DOCS = {
  BASE: '/api/documents',
  UPLOAD: '/api/documents/upload',
  DETAIL: (id: number) => `/api/documents/${id}`,
  DOWNLOAD: (id: number) => `/api/documents/${id}/download`,
  DELETE: (id: number) => `/api/documents/${id}`,
} as const;

export const CASES = {
  BASE: '/api/cases',
  DETAIL: (id: number) => `/api/cases/${id}`,
  ADD_DOC: (id: number) => `/api/cases/${id}/documents`,
  DELETE: (id: number) => `/api/cases/${id}`,
} as const;
