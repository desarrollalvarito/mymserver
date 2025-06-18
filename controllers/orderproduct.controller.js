import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/tokenManager.js'

export const list = async (req, res) => {
    try {
        let ordersProducts = await prisma.orderProduct.findMany()
        return res.send(ordersProducts)
    } catch (error) {
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { orderId, productId, quantity, userAt } = req.body
    try {
        let orderProduct = await prisma.orderProduct.create(
            {
                data: {
                    orderId,
                    productId,
                    quantity,
                    userAt
                }
            }
        )
        return res.send(orderProduct)
    } catch (error) {
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, orderId, productId, quantity, userAt } = req.body
    try {
        let orderProduct = await prisma.orderProduct.update(
            {
                where: {
                    id
                },
                data: {
                    orderId,
                    productId,
                    quantity,
                    userAt
                }
            }
        )
        return res.send(orderProduct)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    try {
        let orderProduct = await prisma.orderProduct.delete(
            {
                where: {
                    id
                }
            }
        )
        return res.send(orderProduct)
    } catch (error) {
        return res.json({ error })
    }
}