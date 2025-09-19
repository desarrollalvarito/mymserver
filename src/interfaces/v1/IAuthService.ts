import { ILoginCredentials, IUserSession, IUserCreate, IUserUpdate } from './IUser';

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

export interface IAuthService {
  login(credentials: ILoginCredentials): Promise<AuthResponse>;
  logout(token: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<{ token: string; user: TokenPayload }>;
  getSession(username: string): Promise<IUserSession | null>;
  validateUser(username: string, password: string): Promise<TokenPayload | null>;
  createUser(userData: IUserCreate): Promise<{ id: number }>;
  updateUser(userData: IUserUpdate): Promise<{ id: number }>;
  getUsers(): Promise<any[]>;
}

export { ILoginCredentials, IUserSession, IUserCreate, IUserUpdate };
