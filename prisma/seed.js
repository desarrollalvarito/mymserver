import { PrismaClient } from '@prisma/client'
import { users, people, employees } from './dataseed.js'
const prisma = new PrismaClient()

async function main() {
    users.forEach(async u => {
        const { username, email, password } = u
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                username,
                email,
                password
            },
        })
    })

    people.forEach(async p => {
        const { run, names, lastName, gender } = p
        await prisma.person.upsert({
            where: { run },
            update: {},
            create: {
                run,
                names,
                lastName,
                gender
            },
        })
    })

    employees.forEach(async p => {
        const { jobRole, workShift, personId } = p
        await prisma.employee.upsert({
            where: { personId },
            update: {},
            create: {
                jobRole,
                workShift,
                personId
            },
        })
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })