import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken, verifyToken } from '../helpers/token.helper.js'

export const get = async (req, res) => {
    try {
        let users = await prisma.user.findMany()
        return res.send(users)
    } catch (error) {
        return res.json({ error })
    }
}

export const session = async (req, res) => {
    const token = req.headers.authorization
    try {
        let verified = verifyToken(token)
        if (!verified) { return res.status(403).json({ error: 'token not valid' }) }
        else {
            let user = await prisma.user.findUnique({
                where: {
                    username: verified.username
                },
                omit: {
                    password: true
                },
                include: {
                    person: {
                        select: {
                            run: true,
                            names: true,
                            lastName: true,
                            gender: true,
                            birthdate: true,
                        }
                    }
                }
            })
            return res.send(user)
        }
    } catch (error) {
        return res.json(error.message)
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body
    try {
        const data = await prisma.user.login(username, password)
        if (!data) {
            throw new Error("Invalid username or password")
        }
        const token = generateToken(username)
        return res.json({ token: token.token, user: { id: data.id, username: data.username, email: data.email } })
    } catch (error) {
        return res.json(error.message)
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

export const info = (req, res) => {
    return res.json({ ok: true })
}

export const logout = (req, res) => {
    return res.status(200).json({ message: 'Session logout' })
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