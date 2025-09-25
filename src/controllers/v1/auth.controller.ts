import { Request, Response } from 'express';
import { body } from 'express-validator';
import { AuthService } from '../../services/v1/auth.service.js';
import { UserRepository } from '../../repositories/v1/user.repository.js';

type ValidationChain = ReturnType<typeof body>;
import { TokenService } from '../../services/v1/token.service.js';
import { prisma } from '../../lib/database.js';
import { ILoginCredentials } from '../../interfaces/v1/IUser.js';

// Inicializar dependencias
const userRepository = new UserRepository(prisma);
const tokenService = new TokenService();
const authService = new AuthService(userRepository, tokenService);

export class AuthController {
  static async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await authService.getUsers();
      return res.send(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getSession(req: Request, res: Response): Promise<Response> {
    try {
      const authorization = req.headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authorization.split(' ')[1];
      const decoded = tokenService.decodeToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userSession = await authService.getSession(decoded.username);
      
      if (!userSession) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.send(userSession);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const credentials: ILoginCredentials = req.body;
      const authResponse = await authService.login(credentials);

      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 12 * 60 * 60
      });

      return res.json(authResponse);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, email, password, personId } = req.body;
      const result = await authService.createUser({
        username,
        email,
        password,
        personId: parseInt(personId)
      });
      
      return res.json({ ok: true, userId: result.id });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id, username, email, password, personId } = req.body;
      const result = await authService.updateUser({
        id: parseInt(id),
        username,
        email,
        password,
        personId: personId ? parseInt(personId) : undefined
      });
      
      return res.json({ ok: true, userId: result.id });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ error: 'Invalid authorization header' });
      }

      const token = authHeader.split(' ')[1];
      await authService.logout(token);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken ||
        req.body.refreshToken ||
        req.headers['x-refresh-token'];

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const result = await authService.refreshToken(refreshToken);
      
      return res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: error.message });
    }
  }

  static validate(method: string): ValidationChain[] {
    switch (method) {
      case 'login':
        return [
          body('username').exists().notEmpty().withMessage('Username is required'),
          body('password').exists().notEmpty().withMessage('Password is required'),
        ];
      case 'create':
        return [
          body('username').exists().notEmpty().withMessage('Username is required'),
          body('password').exists().notEmpty().withMessage('Password is required'),
          body('personId').exists().isInt().withMessage('Valid person ID is required'),
          body('email').optional().isEmail().withMessage('Valid email is required'),
        ];
      case 'update':
        return [
          body('id').exists().isInt().withMessage('Valid ID is required'),
          body('username').optional().notEmpty().withMessage('Username cannot be empty'),
          body('password').optional().notEmpty().withMessage('Password cannot be empty'),
          body('personId').optional().isInt().withMessage('Valid person ID is required'),
          body('email').optional().isEmail().withMessage('Valid email is required'),
        ];
      default:
        return [];
    }
  }
}