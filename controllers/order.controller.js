import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'
import { employees } from '../prisma/dataseed.js'

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

export const list = async (req, res) => {
    const { date } = req.body
    try {
        const searchDate = new Date(date);
        let orders = await prisma.order.findMany({
            where: {
                date: {
                    equals: searchDate,
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
                },
                delivery: {
                    select: {
                        id: true,
                        status: true,
                        driver: {
                            select: {
                                id: true,
                                person: {
                                    select: {
                                        id: true,
                                        run: true,
                                        names: true,
                                        lastName: true
                                    }
                                }
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

export const add = async (req, res) => {
    const { client, date, userAt, orderProduct, delivery } = req.body
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
                                    unitPrice: op.product.price,
                                    userAt
                                }))
                            ]
                        }
                    }
                }
            }
        )
        if (delivery.driver.id) {
            let deliveryCreate = await prisma.delivery.create({
                data: {
                    orderId: order.id,
                    driverId: delivery.driver.id,
                    userAt
                }
            })
        }
        return res.send(order)
    } catch (error) {
        console.log(error)
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    const { id, clientId, date, state, userAt, orderProduct, delivery } = req.body
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
                            unitPrice: op.product.price,
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
                            unitPrice: op.product.price,
                            userAt
                        }
                    })
                }
            })
        }
        if (delivery.driver.id) {
            if (delivery.id) {
                await prisma.delivery.update({
                    where: {
                        id: delivery.id
                    },
                    data: {
                        driverId: delivery.driver.id,
                        status: delivery.status,
                        userAt
                    }
                })
            }
            else {
                await prisma.delivery.create({
                    data: {
                        driverId: delivery.driver.id,
                        userAt
                    }
                })
            }
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