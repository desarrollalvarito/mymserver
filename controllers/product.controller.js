import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/tokenManager.js'

export const get = async (req, res) => {
    try {
        let products = await prisma.product.findMany()
        return res.send(products)
    } catch (error) {
        return res.json({ error })
    }
}