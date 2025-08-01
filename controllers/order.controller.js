import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const list = async (req, res) => {
    try {
        let orderClient = await prisma.order.findMany({
            include: {
                client: true,
            }
        })
        let quantity = await prisma.orderProduct.groupBy({
            by: ['orderId'],
            _sum: {
                quantity: true
            }

        })
        let orders = orderClient.map(o => {
            let q = quantity.find(q => q.orderId === o.id)
            return {
                ...o,
                quantity: q ? q._sum.quantity : 0
            }
        })
        return res.send(orders)
    } catch (error) {
        console.log(error);
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