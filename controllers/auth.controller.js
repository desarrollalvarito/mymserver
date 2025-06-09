import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/tokenManager.js'

export const get = async (req, res) => {
    try {
        let users = await prisma.user.findMany()
        return res.send(users)
    } catch (error) {
        return res.json({ error })
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body
    try {
        let data = await prisma.user.login(username, password)
        console.log(data);
        if (!data.login) {
            return res.status(403).json({ login: false, error: 'credentials not valid' })
        }
        const { token, expiresIn } = generateToken(username)
        return res.json({ data, token, expiresIn })
    } catch (error) {
        return res.json({ login: false, error })
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