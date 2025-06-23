import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const list = async (req, res) => {
    try {
        let clients = await prisma.client.findMany({
            include: {
                person: true
            }
        })
        return res.send(clients)
    } catch (error) {
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { shippingAddress, billName, rut, personId } = req.body
    try {
        let client = await prisma.client.create(
            {
                data: {
                    shippingAddress,
                    billName,
                    rut,
                    personId
                }
            }
        )
        return res.send(client)
    } catch (error) {
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, shippingAddress, billName, rut, personId } = req.body
    try {
        let client = await prisma.client.update(
            {
                where: {
                    id
                },
                data: {
                    shippingAddress,
                    billName,
                    rut,
                    personId
                }
            }
        )
        return res.send(client)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    try {
        let client = await prisma.client.delete(
            {
                where: {
                    id
                }
            }
        )
        return res.send(client)
    } catch (error) {
        return res.json({ error })
    }
}