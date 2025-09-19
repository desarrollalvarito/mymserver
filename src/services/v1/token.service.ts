import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../../helpers/token-blacklist.helper';
import { TokenPayload } from '../../interfaces/v1/IAuthService';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret_refresh';

export class TokenService {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: { id: number }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '12h' });
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string): { id: number } {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as { id: number };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  decodeToken(token: string): TokenPayload | null {
    return jwt.decode(token) as TokenPayload;
  }

  invalidateToken(token: string): void {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    tokenBlacklist.add(actualToken);
  }

  isTokenInvalidated(token: string): boolean {
    return tokenBlacklist.has(token);
  }
}