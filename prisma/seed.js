import { PrismaClient } from '@prisma/client'
import { users, people, employees, products, clients, orders } from './dataseed.js'
const prisma = new PrismaClient()

async function primary() {
    people.forEach(async p => {
        const { id, run, names, lastName, gender } = p
        await prisma.person.upsert({
            where: { run },
            update: {},
            create: {
                id,
                run,
                names,
                lastName,
                gender
            },
        })
    })

    products.forEach(async p => {
        const { id, name, price, userAt } = p
        await prisma.product.create({
            data: {
                id,
                name,
                price,
                userAt
            }
        })
    })
}

async function secondary() {
    users.forEach(async u => {
        const { username, email, password, personId } = u
        await prisma.user.create({
            data: {
                username,
                email,
                password,
                person: {
                    connect: { id: personId }
                }
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

    clients.forEach(async p => {
        const { shippingAddress, billName, rut, personId } = p
        await prisma.client.upsert({
            where: { rut },
            update: {},
            create: {
                shippingAddress,
                billName,
                rut,
                personId
            },
        })
    })
}

async function third() {
    orders.forEach(async o => {
        const { clientId, date, orderProduct } = o
        await prisma.order.create({
            data: {
                clientId,
                date,
                userAt: 1, // Assuming a default userAt value
                orderProduct: {
                    create: orderProduct.map(op => ({
                        productId: op.productId,
                        quantity: op.quantity,
                        aditional: op.aditional || false,
                        userAt: 1 // Assuming a default userAt value
                    }))
                }
            }
        })
    })
}
async function main() {
    console.log("inicio seed");
}
/* async function main() {

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
                person: {
                    create: {
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
                person: {
                    create: {
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
                person: {
                    create: {
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
} */
main()
    .then(primary)
    .then(secondary)
    .then(third)
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })