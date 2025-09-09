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
    const { date, cook, userAt, productionProduct } = req.body
    try {
        let production = await prisma.production.create(
            {
                data: {
                    date,
                    assignedTo: cook.id,
                    userAt,
                    productionProduct: {
                        createMany: {
                            data: [
                                ...productionProduct.map(pp => ({
                                    productId: pp.product.id,
                                    quantity: pp.quantity,
                                    userAt
                                }))
                            ]
                        }
                    }
                }
            }
        )
        return res.send(production)
    } catch (error) {
        console.log(error)
        return res.json({ error })
    }
}
export const modify = async (req, res) => {
    console.log("modificando production");
    const { id, date, cook, status, userAt, productionProduct } = req.body
    try {
        let production = await prisma.production.update(
            {
                where: {
                    id
                },
                data: {
                    date,
                    assignedTo: cook.id,
                    status,
                    userAt
                }
            }
        )
        if (productionProduct && Array.isArray(productionProduct)) {
            console.log("production", productionProduct);
            productionProduct.map(async (op) => {
                console.log("op", op);
                if (op.id) {
                    await prisma.productionProduct.update({
                        where: { id: op.id },
                        data: {
                            productId: op.product.id,
                            quantity: op.quantity,
                            userAt
                        }
                    })
                } else {
                    await prisma.productionProduct.create({
                        data: {
                            productionId: production.id,
                            productId: op.product.id,
                            quantity: op.quantity,
                            userAt
                        }
                    })
                }
            })
        }
        console.log(production);
        return res.send(production)
    } catch (error) {
        return res.json({ error })
    }
}
export const remove = async (req, res) => {
    const { id } = req.body
    console.log(id);
    try {
        let production = await prisma.production.update(
            {
                where: {
                    id
                },
                data: {
                    status: 'CANCELLED',
                }
            }
        )
        console.log(production);
        return res.send(production)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}

export const totalOrdersProductions = async (req, res) => {
    const { date } = req.body
    try {
        const searchDate = new Date(date);
        console.log(searchDate, date);
        let productions = await prisma.productionProduct.groupBy({
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
        console.log(productions);
        let orders = await prisma.orderProduct.groupBy({
            where: {
                order: {
                    date: {
                        equals: searchDate,
                    },
                    AND: {
                        state: {
                            not: 'CANCELLED'
                        }
                    }
                },
                state: 'ACTIVE'
            },
            by: ['productId'],
            _sum: {
                quantity: true
            }
        })
        console.log(orders);
        let products = await prisma.product.findMany({
            where: {
                state: 'ACTIVE'
            },
            select: {
                id: true,
                name: true
            }
        })
        console.log(products);
        products.map((p) => {
            p.productions = productions.find(pro => pro.productId === p.id)?._sum.quantity || 0
            p.orders = orders.find(o => o.productId === p.id)?._sum.quantity || 0
        })
        return res.send(products)
    } catch (error) {
        console.log(error);
        return res.json({ error })
    }
}

// Consultas para obtener total de órdenes y total de productos
export const productionMetrics = async (req, res) => {
    const { date } = req.body
    console.log(date);
    const whereClause = date ? {
        date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lte: new Date(date + 'T23:59:59.999Z')
        }
    } : {}

    console.log(whereClause);

    // 1. TOTAL DE ÓRDENES DEL DÍA
    const totalOrdenes = await prisma.order.count({
        where: {
            ...whereClause,
            state: {
                not: 'CANCELLED'
            }
        }
    })

    // 2. TOTAL DE PRODUCTOS SOLICITADOS EN ÓRDENES
    const totalProductosSolicitados = await prisma.orderProduct.aggregate({
        where: {
            order: {
                ...whereClause,
                state: {
                    not: 'CANCELLED'
                }
            },
            state: 'ACTIVE'
        },
        _sum: {
            quantity: true
        }
    })

    // 3. TOTAL PRODUCTOS PROGRAMADOS EN PRODUCCIÓN (PENDING)
    const totalProductosProgramados = await prisma.productionProduct.aggregate({
        where: {
            production: {
                ...whereClause,
                status: 'PENDING'
            }
        },
        _sum: {
            quantity: true
        }
    })

    // 4. TOTAL PRODUCTOS EN PRODUCCIÓN (IN_PROGRESS)
    const totalProductosEnProceso = await prisma.productionProduct.aggregate({
        where: {
            production: {
                ...whereClause,
                status: 'IN_PROGRESS'
            }
        },
        _sum: {
            quantity: true
        }
    })

    return res.send({
        totalOrdenes,
        totalProductos: totalProductosSolicitados._sum.quantity || 0,
        produccionProgramada: totalProductosProgramados._sum.quantity || 0,
        produccionEnProceso: totalProductosEnProceso._sum.quantity || 0,
        productosDisponibles: (totalProductosSolicitados._sum.quantity || 0) - (totalProductosProgramados._sum.quantity || 0)
    })
}