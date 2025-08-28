export const people = [
    {
        id: 1,
        run: '21325',
        names: 'Pablo Kevin',
        lastName: 'Oro mamani',
        gender: 'MALE'
    },
    {
        id: 2,
        run: '20325',
        names: 'Luis Paolo',
        lastName: 'Aro Mamani',
        gender: 'MALE'
    },
    {
        id: 3,
        run: '124325',
        names: 'Juan',
        lastName: 'Tarqui Yapura',
        gender: 'MALE'
    },
    {
        id: 4,
        run: '124324',
        names: 'Julia',
        lastName: 'Tarqui Yapura',
        gender: 'FEMALE'
    },
    {
        id: 5,
        run: '12325',
        names: 'Pablo',
        lastName: 'Mamani Aro',
        gender: 'MALE'
    },
    {
        id: 6,
        run: '11326',
        names: 'Paolo',
        lastName: 'Mamani Arce',
        gender: 'MALE'
    },
    {
        id: 7,
        run: '11327',
        names: 'Kevin',
        lastName: 'Nanijo Arce',
        gender: 'MALE'
    },
    {
        id: 8,
        run: '11328',
        names: 'Luisa',
        lastName: 'Nayar Arce',
        gender: 'FEMALE'
    }
]

export const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$NJwtsnGBiJM7oqvTPWBHZeSTfrYFVDjL9tjRPRTLf/oUQ1nTBRxN.',
        personId: 1
    }
]

export const employees = [
    {
        id: 1,
        jobRole: 'ADMIN',
        workShift: 'completo',
        personId: 1
    },
    {
        id: 2,
        jobRole: 'BAKER',
        workShift: 'mañana',
        personId: 5
    },
    {
        id: 3,
        jobRole: 'BAKER',
        workShift: 'mañana',
        personId: 6
    },
    {
        id: 4,
        jobRole: 'DELIVERY',
        workShift: 'completo',
        personId: 7
    }
]

export const clients = [
    {
        id: 1,
        shippingAddress: "Av. Siempre Viva 123",
        billName: 'Oro mamani',
        rut: "21325-R",
        personId: 2
    },
    {
        id: 2,
        shippingAddress: "Calle Falsa 456",
        billName: 'Aro Mamani',
        rut: "20325-R",
        personId: 3
    },
    {
        id: 3,
        shippingAddress: "Paseo Ahumada 123",
        billName: 'Nayar Arce',
        rut: "11328-R",
        personId: 8
    }
]

export const products = [
    {
        id: 1,
        name: 'empanada de pino',
        price: 1000,
        userAt: 1
    },
    {
        id: 2,
        name: 'empanada picante',
        price: 1200,
        userAt: 1
    },
    {
        id: 3,
        name: 'empanada de queso',
        price: 1500,
        userAt: 1
    },
    {
        id: 4,
        name: 'empanada de pollo',
        price: 1000,
        userAt: 1
    },
    {
        id: 5,
        name: 'empanada de mariscos',
        price: 2000,
        userAt: 1
    },
    {
        id: 6,
        name: 'empanada de choclo',
        price: 1300,
        userAt: 1
    },
]

export const orders = [
    {
        id: 1,
        clientId: 1,
        date: new Date(),
        orderProduct: [
            {
                productId: 1,
                unitPrice: 1000,
                quantity: 2,
            },
            {
                productId: 2,
                unitPrice: 1200,
                quantity: 1,
            }
        ]
    },
    {
        id: 2,
        clientId: 2,
        date: new Date(),
        orderProduct: [
            {
                productId: 3,
                unitPrice: 1500,
                quantity: 3,
            }
        ]
    }
]

export const deliveries = [
    {
        id: 1,
        orderId: 1,
        driverId: 4,
        scheduled: new Date(),
        notes: 'Entregar en la puerta principal',
        userAt: 1
    },
    {
        id: 2,
        orderId: 2,
        driverId: 4,
        scheduled: new Date(),
        notes: 'Entregar en la puerta principal',
        userAt: 1
    }
]