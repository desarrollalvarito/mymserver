import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const list = async (req, res) => {
    try {
        let peoople = await prisma.person.findMany()
        return res.send(peoople)
    } catch (error) {
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { run, names, lastNames, gender, address, contact, birthdate } = req.body
    try {
        let person = await prisma.person.create(
            {
                data: {
                    run,
                    names,
                    lastNames,
                    gender,
                    address,
                    contact,
                    birthdate
                }
            }
        )
        return res.send(person)
    } catch (error) {
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, run, names, lastNames, gender, address, contact, birthdate } = req.body
    try {
        let person = await prisma.person.update(
            {
                where: {
                    id
                },
                data: {
                    run,
                    names,
                    lastNames,
                    gender,
                    address,
                    contact,
                    birthdate
                }
            }
        )
        return res.send(person)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    try {
        let person = await prisma.person.delete(
            {
                where: {
                    id
                }
            }
        )
        return res.send(persons)
    } catch (error) {
        return res.json({ error })
    }
}