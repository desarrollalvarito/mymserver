import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/v1/token.service.js";
import { tokenBlacklist } from '../helpers/token-blacklist.helper.js';

const tokenService = new TokenService();

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token de acceso requerido' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (tokenBlacklist.has(token)) {
        res.status(403).json({ error: 'Token revocado' });
        return;
    }

    try {
        const decoded = tokenService.verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch (error: any) {
        console.error('Token verification error:', error.message);
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};