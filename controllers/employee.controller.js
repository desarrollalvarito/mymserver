import { prisma } from '../config/db.js'
import { body } from 'express-validator'

export const list = async (req, res) => {
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

export const add = async (req, res) => {
    console.log(req.body)
    try {
        const { jobRole, workShift, personId } = req.body
        let employee = await prisma.employee.create({
            data: {
                jobRole,
                workShift,
                personId
            }
        })
        return res.send(employee)
    } catch (error) {
        console.log(error)
        return res.json({ ok: false, error })
    }
}

export const modify = async (req, res) => {
    try {
        const { id, jobRole, workShift, personId } = req.body
        console.log(req.body);
        let employee = await prisma.employee.update({
            where: {
                id
            },
            data: {
                jobRole,
                workShift,
                personId
            }
        })
        return res.send(employee)
    } catch (error) {
        return res.json({ ok: false, error })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.body
        console.log(req.body);
        let employee = await prisma.employee.remove({
            where: {
                id
            }
        })
        return res.send(employee)
    } catch (error) {
        return res.json({ ok: false, error })
    }
}