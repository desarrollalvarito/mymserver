import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const list = async (req, res) => {
    try {
        let products = await prisma.product.findMany()
        return res.send(products)
    } catch (error) {
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { name, price, userAt } = req.body
    try {
        let product = await prisma.product.create(
            {
                data: {
                    name,
                    price,
                    userAt
                }
            }
        )
        return res.send(product)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, name, price, userAt } = req.body
    try {
        let product = await prisma.product.update(
            {
                where: {
                    id
                },
                data: {
                    name,
                    price,
                    userAt
                }
            }
        )
        return res.send(product)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    try {
        let product = await prisma.product.delete(
            {
                where: {
                    id
                }
            }
        )
        return res.send(product)
    } catch (error) {
        return res.json({ error })
    }
}