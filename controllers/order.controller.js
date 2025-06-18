import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/tokenManager.js'

export const list = async (req, res) => {
    try {
        let orders = await prisma.order.findMany()
        return res.send(orders)
    } catch (error) {
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { clientId, date, userAt } = req.body
    try {
        let order = await prisma.order.create(
            {
                data: {
                    clientId,
                    date,
                    userAt
                }
            }
        )
        return res.send(order)
    } catch (error) {
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, clientId, date, userAt } = req.body
    try {
        let order = await prisma.order.update(
            {
                where: {
                    id
                },
                data: {
                    clientId,
                    date,
                    userAt
                }
            }
        )
        return res.send(order)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    try {
        let order = await prisma.order.delete(
            {
                where: {
                    id
                }
            }
        )
        return res.send(order)
    } catch (error) {
        return res.json({ error })
    }
}