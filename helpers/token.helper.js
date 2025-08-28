import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { tokenBlacklist } from './token-blacklist.helper.js'

const secret = process.env.JWT_SECRET || 'secret'
const secretRefresh = process.env.JWT_REFRESH_SECRET || 'secret'
const expiresIn = process.env.JWT_EXPIRES || '5m'
const expiresInRefresh = process.env.JWT_REFRESH_EXPIRES || '7d'

export const generateToken = (payload) => {
    try {
        return jwt.sign(payload, secret, { expiresIn }) // Sin encapsular en objeto
    } catch (error) {
        console.log('Error generating token:', error.message);
        throw error
    }
}

export const generateRefreshToken = (payload) => {
    try {
        return jwt.sign(payload, secretRefresh, { expiresIn: expiresInRefresh })
    } catch (error) {
        console.log('Error generating refresh token:', error.message);
        throw error
    }
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        console.log('Error verifying token:', error.message);
        throw new Error('Token inválido o expirado')
    }
}

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, secretRefresh)
    } catch (error) {
        console.log('Error verifying refresh token:', error.message);
        throw new Error('Refresh token inválido o expirado')
    }
}

// Decodificar Token sin verificar (útil para obtener información)
export const decodeToken = (token) => {
    try {
        return jwt.decode(token)
    } catch (error) {
        console.log('Error decoding token:', error.message)
        return null
    }
}

export const removeToken = (token) => {
    try {
        // Extraer el token si viene con "Bearer "
        const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
        tokenBlacklist.add(actualToken)
        return true
    } catch (error) {
        console.log('Error removing token:', error.message)
        return false
    }
}