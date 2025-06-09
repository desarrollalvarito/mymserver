import { prisma } from '../config/db.js'
import { body } from 'express-validator'

export const get = async (req, res) => {
    try {
        let employees = await prisma.employee.findMany({
            include: {
                person: true,
            }
        })
        return res.send(employees)
    } catch (error) {
        return res.json({ error })
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