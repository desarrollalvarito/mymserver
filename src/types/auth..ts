export interface TokenPayload {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  user: TokenPayload;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserSession {
  id: number;
  username: string;
  email: string | null;
  person: {
    id: number;
    run: string | null;
    names: string;
    lastName: string | null;
    employee?: {
      jobRole: string;
      workShift: string;
    } | null;
  };
}