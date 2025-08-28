import { verifyToken } from "../helpers/token.helper.js"
import { tokenBlacklist } from '../helpers/token-blacklist.helper.js'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acceso requerido' })
    }

    const token = authHeader.split(' ')[1]

    // Verificar si el token está en la blacklist
    if (tokenBlacklist.has(token)) {
        return res.status(403).json({ error: 'Token revocado' })
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded.payload
        next()
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' })
    }
}