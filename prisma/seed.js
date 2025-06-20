import { PrismaClient } from '@prisma/client'
import { users, people, employees, products, clients } from './dataseed.js'
const prisma = new PrismaClient()

async function main() {

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

    users.forEach(async u => {
        const { username, email, password, person } = u
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                username,
                email,
                password,
                person:{
                    create:{
                        run: person.run,
                        names: person.names,
                        lastName: person.lastName,
                        gender: person.gender
                    }
                }
            },
        })
    })

    employees.forEach(async p => {
        const { jobRole, workShift, person } = p
        await prisma.employee.upsert({
            where: { personId: person.id },
            update: {},
            create: {
                jobRole,
                workShift,
                person:{
                    create:{
                        run: person.run,
                        names: person.names,
                        lastName: person.lastName,
                        gender: person.gender
                    }
                }
            },
        })
    })

    clients.forEach(async p => {
        const { shippingAddress, billName, rut, person } = p
        await prisma.client.upsert({
            where: { rut },
            update: {},
            create: {
                shippingAddress,
                billName,
                rut,
                person:{
                    create:{
                        run: person.run,
                        names: person.names,
                        lastName: person.lastName,
                        gender: person.gender
                    }
                }
            },
        })
    })

    products.forEach(async p => {
        const { name, price, userAt } = p
        await prisma.product.create({
            data: {
                name,
                price,
                userAt
            }
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