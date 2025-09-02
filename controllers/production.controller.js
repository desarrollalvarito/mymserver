import { prisma } from '../config/db.js'
import { body } from 'express-validator'
import { generateToken } from '../helpers/token.helper.js'

export const list = async (req, res) => {
    const { date } = req.body
    try {
        const searchDate = new Date(date);
        console.log(date, searchDate);
        let production = await prisma.production.findMany({
            where: {
                date: {
                    equals: searchDate,
                },
            },
            select: {
                id: true,
                date: true,
                cook: {
                    select: {
                        id: true,
                        workShift: true,
                        person: {
                            select: {
                                id: true,
                                run: true,
                                names: true,
                                lastName: true,
                                gender: true
                            }
                        }
                    }
                },
                status: true,
                userAt: true,
                productionProduct: {
                    select: {
                        id: true,
                        quantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            }
                        },
                    }
                },
            },
            orderBy: {
                createdAt: 'asc' // Ordena por fecha de creación
            }
        })
        console.log(production);
        return res.send(production)
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

export const totalProductions = async (req, res) => {
    const { date } = req.body
    try {
        const searchDate = new Date(date);
        console.log(searchDate, date);
        let total = await prisma.productionProduct.groupBy({
            where: {
                production: {
                    date: {
                        equals: searchDate,
                    },
                    AND: {
                        status: {
                            not: 'CANCELLED'
                        }
                    }
                }
            },
            by: ['productId'],
            _sum: {
                quantity: true
            }
        })
        let products = await prisma.product.findMany({
            where: {
                state: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                price: true
            }
        })

        products.map((p) => {
            p.total = total.find(t => t.productId === p.id)?._sum.quantity || 0
        })
        return res.send(products)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}