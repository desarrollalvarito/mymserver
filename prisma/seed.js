import { PrismaClient } from '@prisma/client'
import { users, people, employees, products, clients, orders, deliveries } from './dataseed.js'

const prisma = new PrismaClient()

async function seedPeople() {
    console.log('Sembrando personas...')
    for (const p of people) {
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
    }
    console.log('Personas sembradas correctamente')
}

async function seedProducts() {
    console.log('Sembrando productos...')
    for (const p of products) {
        const { id, name, price, userAt } = p
        await prisma.product.upsert({
            where: { id },
            update: {},
            create: {
                id,
                name,
                price,
                userAt
            }
        })
    }
    console.log('Productos sembrados correctamente')
}

async function seedUsers() {
    console.log('Sembrando usuarios...')
    for (const u of users) {
        const { username, email, password, personId } = u
        
        // Verificar que la persona existe primero
        const personExists = await prisma.person.findUnique({
            where: { id: personId }
        })
        
        if (!personExists) {
            console.warn(`Persona con id ${personId} no existe, saltando usuario ${username}`)
            continue
        }
        
        await prisma.user.upsert({
            where: { username },
            update: {},
            create: {
                username,
                email,
                password,
                person: {
                    connect: { id: personId }
                }
            },
        })
    }
    console.log('Usuarios sembrados correctamente')
}

async function seedEmployees() {
    console.log('Sembrando empleados...')
    for (const p of employees) {
        const { jobRole, workShift, personId } = p
        
        // Verificar que la persona existe
        const personExists = await prisma.person.findUnique({
            where: { id: personId }
        })
        
        if (!personExists) {
            console.warn(`Persona con id ${personId} no existe, saltando empleado`)
            continue
        }
        
        await prisma.employee.upsert({
            where: { personId },
            update: {},
            create: {
                jobRole,
                workShift,
                personId
            },
        })
    }
    console.log('Empleados sembrados correctamente')
}

async function seedClients() {
    console.log('Sembrando clientes...')
    for (const p of clients) {
        const { shippingAddress, billName, rut, personId } = p
        
        // Verificar que la persona existe
        const personExists = await prisma.person.findUnique({
            where: { id: personId }
        })
        
        if (!personExists) {
            console.warn(`Persona con id ${personId} no existe, saltando cliente ${billName}`)
            continue
        }
        
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
    }
    console.log('Clientes sembrados correctamente')
}

async function seedOrders() {
    console.log('Sembrando órdenes...')
    for (const o of orders) {
        const { clientId, date, orderProduct } = o
        
        // Verificar que el cliente existe
        const clientExists = await prisma.client.findUnique({
            where: { id: clientId }
        })
        
        if (!clientExists) {
            console.warn(`Cliente con id ${clientId} no existe, saltando orden`)
            continue
        }
        
        // Verificar que los productos existen
        for (const op of orderProduct) {
            const productExists = await prisma.product.findUnique({
                where: { id: op.productId }
            })
            
            if (!productExists) {
                console.warn(`Producto con id ${op.productId} no existe, saltando orden`)
                continue
            }
        }
        
        await prisma.order.create({
            data: {
                clientId,
                date,
                userAt: 1,
                orderProduct: {
                    create: orderProduct.map(op => ({
                        productId: op.productId,
                        quantity: op.quantity,
                        unitPrice: op.unitPrice || 0,
                        userAt: 1
                    }))
                }
            }
        })
    }
    console.log('Órdenes sembradas correctamente')
}

async function seedDeliveries() {
    console.log('Sembrando entregas...')
    for (const o of deliveries) {
        const { orderId, driverId, scheduled, notes, userAt } = o
        
        // Verificar que la orden existe
        const orderExists = await prisma.order.findUnique({
            where: { id: orderId }
        })
        
        if (!orderExists) {
            console.warn(`Orden con id ${orderId} no existe, saltando entrega`)
            continue
        }
        
        // Verificar que el driver existe (asumiendo que driverId es personId)
        const driverExists = await prisma.person.findUnique({
            where: { id: driverId }
        })
        
        if (!driverExists) {
            console.warn(`Conductor con id ${driverId} no existe, saltando entrega`)
            continue
        }
        
        await prisma.delivery.upsert({
            where: { orderId },
            update: {},
            create: {
                orderId,
                driverId,
                scheduled,
                notes,
                userAt
            }
        })
    }
    console.log('Entregas sembradas correctamente')
}

async function main() {
    try {
        console.log("Iniciando seed...")
        
        // Ejecutar en el orden CORRECTO de dependencias
        await seedPeople()        // Primero: personas (base de todo)
        await seedProducts()      // Segundo: productos (independiente)
        await seedUsers()         // Tercero: usuarios (dependen de personas)
        await seedEmployees()     // Cuarto: empleados (dependen de personas)
        await seedClients()       // Quinto: clientes (dependen de personas)
        await seedOrders()        // Sexto: órdenes (dependen de clientes y productos)
        await seedDeliveries()    // Séptimo: entregas (dependen de órdenes y personas)
        
        console.log('✅ Seed completado exitosamente!')
    } catch (error) {
        console.error('❌ Error en seed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()