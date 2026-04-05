// API Types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface Document {
  id: number;
  originalFilename: string;
  documentType: 'LEGAL_BOOK' | 'CASE_FILE';
  uploadedAt: string;
  category?: string;
  caseId?: number;
}

export interface CaseFile {
  id: number;
  caseTitle: string;
  description: string;
  status: string;
  createdAt: string;
  documents?: Document[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface CreateCaseRequest {
  caseTitle: string;
  description: string;
    status: string
  }

export interface AddDocumentToCaseRequest {
  id: number;
}
