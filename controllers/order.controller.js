import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const getProduct = async (req, res) => {
    const { id } = req.body
    try {
        let order = await prisma.orderProduct.findMany({
            where: {
                orderId: id,
                AND: [
                    {
                        state: {
                            not: 'INACTIVE'
                        }
                    }
                ]
            },
            select: {
                id: true,
                orderId: true,
                quantity: true,
                aditional: true,
                state: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    }
                }
            }
        })
        return res.send(order)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}

export const listToday = async (req, res) => {
    try {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;

        // Convertir inicio del día local a UTC
        const startOfDayLocal = new Date(now);
        startOfDayLocal.setHours(0, 0, 0, 0);
        const startOfDayUTC = new Date(startOfDayLocal.getTime() - timezoneOffset);

        // Convertir fin del día local a UTC
        const endOfDayLocal = new Date(now);
        endOfDayLocal.setHours(23, 59, 59, 999);
        const endOfDayUTC = new Date(endOfDayLocal.getTime() - timezoneOffset);
        let orders = await prisma.order.findMany({
            where: {
                date: {
                    gte: startOfDayUTC,
                    lte: endOfDayUTC
                },
            },
            select: {
                id: true,
                date: true,
                state: true,
                userAt: true,
                client: true,
                orderProduct: {
                    select: {
                        id: true,
                        quantity: true,
                        aditional: true,
                        state: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            }
                        },
                    }
                }
            },
            orderBy: {
                createdAt: 'asc' // Ordena por fecha de creación
            }
        })
        orders = orders.map(o => {
            let quantity = o.orderProduct.reduce((acc, op) => op.state !== 'INACTIVE' ? acc + op.quantity : acc, 0);
            return {
                ...o,
                quantity
            }
        })
        return res.send(orders)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}

export const listDates = async (req, res) => {
    try {
        const { date } = req.body; // Espera formato YYYY-MM-DD

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        let orderClient = await prisma.order.findMany({
            where: {
                date: {
                    gte: startDate,
                    lt: endDate
                }
            },
            include: {
                client: true
            }
        })
        let quantity = await prisma.orderProduct.groupBy({
            by: ['orderId'],
            _sum: {
                quantity: true
            }

        })
        let orders = orderClient.map(o => {
            let q = quantity.find(q => q.orderId === o.id)
            return {
                ...o,
                quantity: q ? q._sum.quantity : 0
            }
        })
        return res.send(orders)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}

export const add = async (req, res) => {
    const { client, date, userAt, orderProduct } = req.body
    try {
        let order = await prisma.order.create(
            {
                data: {
                    clientId: client.id,
                    date,
                    userAt,
                    orderProduct: {
                        createMany: {
                            data: [
                                ...orderProduct.map(op => ({
                                    productId: op.product.id,
                                    quantity: op.quantity,
                                    aditional: op.aditional,
                                    userAt
                                }))
                            ]
                        }
                    }
                }
            }
        )
        return res.send(order)
    } catch (error) {
        console.log(error)
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, clientId, date, state, userAt, orderProduct } = req.body
    try {
        let order = await prisma.order.update(
            {
                where: {
                    id
                },
                data: {
                    clientId,
                    date,
                    state,
                    userAt
                }
            }
        )
        if (orderProduct && Array.isArray(orderProduct)) {
            orderProduct.map(async (op) => {
                if (op.id) {
                    await prisma.orderProduct.update({
                        where: { id: op.id },
                        data: {
                            productId: op.product.id,
                            quantity: op.quantity,
                            aditional: op.aditional,
                            state: op.state,
                            userAt
                        }
                    })
                } else {
                    await prisma.orderProduct.create({
                        data: {
                            productId: op.product.id,
                            orderId: order.id,
                            quantity: op.quantity,
                            aditional: op.aditional,
                            userAt
                        }
                    })
                }
            })
        }
        console.log(order);
        return res.send(order)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    console.log(id);
    try {
        let order = await prisma.order.update(
            {
                where: {
                    id
                },
                data: {
                    state: 'CANCELLED',
                }
            }
        )
        console.log(order);
        return res.send(order)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}