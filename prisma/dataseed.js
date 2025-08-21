export const people = [
    {
        run: '21325',
        names: 'pablo Kevin',
        lastName: 'Oro mamani',
        gender: 'MALE'
    },
    {
        run: '20325',
        names: 'Luis paolo',
        lastName: 'Aro mamani',
        gender: 'MALE'
    },
    {
        run: '124325',
        names: 'juan',
        lastName: 'tarqui',
        gender: 'MALE'
    },
    {
        run: '124324',
        names: 'julia',
        lastName: 'tarqui',
        gender: 'FEMALE'
    },
    {
        run: '12325',
        names: 'pablo',
        lastName: 'mamani',
        gender: 'MALE'
    },
    {
        run: '11325',
        names: 'paolo',
        lastName: 'mamani',
        gender: 'MALE'
    }
]

export const users = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$NJwtsnGBiJM7oqvTPWBHZeSTfrYFVDjL9tjRPRTLf/oUQ1nTBRxN.',
        personId: 1
    }
]

export const employees = [
    {
        jobRole: 'ADMINISTRATOR',
        workShift: 'completo',
        personId: 4
    },
    {
        jobRole: 'COOK',
        workShift: 'tarde',
        personId: 5
    }
]

export const clients = [
    {
        shippingAddress: "Paseo Ahumada 123",
        billName: 'Mamani',
        rut: "11325-R",
        personId: 6
    }
]

export const products = [
    {
        name: 'empanada de pino',
        price: 1000,
        userAt: 1
    },
    {
        name: 'empanada picante',
        price: 1200,
        userAt: 1
    },
    {
        name: 'empanada de queso',
        price: 1500,
        userAt: 1
    },
    {
        name: 'empanada de pollo',
        price: 1000,
        userAt: 1
    },
    {
        name: 'empanada de mariscos',
        price: 2000,
        userAt: 1
    },
    {
        name: 'empanada de choclo',
        price: 1300,
        userAt: 1
    },
]

export const orders = [
    {
        clientId: 1,
        date: new Date(),
        orderProduct: [
            {
                productId: 1,
                quantity: 2,
            },
            {
                productId: 2,
                quantity: 1,
            }
        ]
    },
    {
        clientId: 1,
        date: new Date(),
        orderProduct: [
            {
                productId: 3,
                quantity: 3,
            }
        ]
    }
]
