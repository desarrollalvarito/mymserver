import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { tokenBlacklist } from '../helpers/token-blacklist.helper.js'
import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken, decodeToken, removeToken } from '../helpers/token.helper.js'

export const get = async (req, res) => {
    try {
        let users = await prisma.user.findMany()
        return res.send(users)
    } catch (error) {
        return res.json({ error })
    }
}

export const session = async (req, res) => {
    const authorization = req.headers?.authorization
    if (!authorization) return res.status(403).json({ error: 'no token provided' })
    const token = authorization.split(' ')[1] // Bearer <token>
    try {
        let verified = decodeToken(token)
        if (!verified) { return res.status(403).json({ error: 'token not valid' }) }
        else {
            let user = await prisma.user.findUnique({
                where: {
                    username: verified.username
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    person: {
                        select: {
                            id: true,
                            run: true,
                            names: true,
                            lastName: true,
                            employee: {
                                select: {
                                    jobRole: true,
                                    workShift: true
                                }
                            }
                        }
                    }
                },
            })
            console.log("session :");
            return res.send(user)
        }
    } catch (error) {
        console.log(error);
        return res.json(error.message)
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await prisma.user.login(username, password)
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" })
        }

        // Generar tokens con estructura consistente
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        }

        const token = generateToken(tokenPayload)
        const refreshToken = generateRefreshToken({ id: user.id })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Usar true en producción
            sameSite: 'strict', // Ajustar según sea necesario
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        })

        return res.json(
            {
                user: tokenPayload,
                token,
                refreshToken
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message })
    }
}

export const create = async (req, res) => {
    try {
        const { username, email, password, personId } = req.body
        console.log(req.body);
        let user = await prisma.user.create({
            data: {
                username,
                email,
                password,
                personId
            }
        })
        return res.json({ ok: true })
    } catch (error) {
        return res.json({ ok: false, error })
    }
}

export const update = async (req, res) => {
    try {
        const { id, username, email, password, personId } = req.body
        console.log(req.body);
        let user = await prisma.user.update({
            where: {
                id
            },
            data: {
                username,
                email,
                password,
                personId
            }
        })
        return res.json({ ok: true })
    } catch (error) {
        return res.json({ ok: false, error })
    }
}

export const logout = (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Token no proporcionado o formato incorrecto' })
    }

    // Invalidar el token
    const token = authHeader.split(' ')[1]
    removeToken(token)

    // Limpiar la cookie de refresh token
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    return res.status(200).json({
        message: 'Sesión cerrada exitosamente',
        ok: true
    })
}

export const refreshToken = async (req, res) => {
    try {
        // Buscar refresh token en múltiples lugares
        const refreshToken = req.cookies.refreshToken ||
            req.body.refreshToken ||
            req.headers['x-refresh-token']

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token requerido',
                details: 'Debe proporcionar un refresh token en cookies, body o headers'
            })
        }

        const result = await renewToken(refreshToken)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.log('Error en refreshToken:', error.message)

        // Limpiar cookie si el refresh token es inválido
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        res.status(403).json({
            error: 'Token de refresh inválido',
            details: error.message
        })
    }
}

export const validate = (method) => {
    switch (method) {
        case 'login':
            return [
                body('username', 'username format incorrect').exists().notEmpty(),
                body('password', 'password format incorrect').exists().notEmpty(),
            ]
        case 'create':
            return [
                body('username', 'username format incorrect').exists().notEmpty(),
                body('password', 'password format incorrect').exists().notEmpty(),
            ]
        case 'update':
            return [
                body('id', 'id format incorrect').exists().isInt(),
                body('username', 'username format incorrect').exists().notEmpty(),
                body('password', 'password format incorrect').exists().notEmpty(),
            ]
    }
}

const renewToken = async (refreshToken) => {
    try {
        // Verificar si el refresh token está revocado
        if (tokenBlacklist.has(refreshToken)) {
            throw new Error('Refresh token revocado')
        }

        // Verificar el refresh token
        const decoded = verifyRefreshToken(refreshToken)

        // Buscar usuario - ahora decoded contiene el payload directamente
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }, // Cambiado de decoded.payload a decoded.id
            select: {
                id: true,
                username: true,
                email: true
            }
        })

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        // Generar nuevo access token
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        }

        const token = generateToken(tokenPayload)

        return {
            token,
            user: tokenPayload
        }

    } catch (error) {
        console.log('Error renewing token:', error.message)
        throw new Error('Error al renovar token: ' + error.message)
    }
}