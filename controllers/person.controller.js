import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/tokenManager.js'

export const listPerson = async (req, res) => {
    try {
        let peoople = await prisma.person.findMany()
        return res.send(peoople)
    } catch (error) {
        return res.json({ error })
    }
}

export const createPerson = async (req, res) => {
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
export const updatePerson = async (req, res) => {
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
export const deletePerson = async (req, res) => {
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