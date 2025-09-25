import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/v1/user.repository.js';
import { TokenService } from './token.service.js';
import { 
  ILoginCredentials, 
  IUserSession, 
  IUserCreate, 
  IUserUpdate,
  TokenPayload,
  AuthResponse 
} from '../../interfaces/v1/IAuthService';

export class AuthService {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor(userRepository: UserRepository, tokenService: TokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async login(credentials: ILoginCredentials): Promise<AuthResponse> {
    const user = await this.validateUser(credentials.username, credentials.password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const token = this.tokenService.generateToken(user);
    const refreshToken = this.tokenService.generateRefreshToken({ id: user.id });

    return {
      user,
      token,
      refreshToken
    };
  }

  async logout(token: string): Promise<void> {
    this.tokenService.invalidateToken(token);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; user: TokenPayload }> {
    if (this.tokenService.isTokenInvalidated(refreshToken)) {
      throw new Error('Refresh token revoked');
    }

    const decoded = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email || undefined
    };

    const newToken = this.tokenService.generateToken(tokenPayload);

    return {
      token: newToken,
      user: tokenPayload
    };
  }

  async getSession(username: string): Promise<IUserSession | null> {
    return this.userRepository.findUserWithPerson(username);
  }

  async validateUser(username: string, password: string): Promise<TokenPayload | null> {
    const user = await this.userRepository.validateCredentials(username);
    
    if (!user) {
      return null;
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email || undefined
    };
  }

  async createUser(userData: IUserCreate): Promise<{ id: number }> {
    const existingUser = await this.userRepository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const user = await this.userRepository.create(userData);
    return { id: user.id };
  }

  async updateUser(userData: IUserUpdate): Promise<{ id: number }> {
    const user = await this.userRepository.update(userData);
    return { id: user.id };
  }

  async getUsers(): Promise<any[]> {
    return this.userRepository.findAll();
  }
}