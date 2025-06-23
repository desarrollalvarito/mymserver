import { Prisma, PrismaClient } from '@prisma/client'
import bycrypt from 'bcryptjs'

const defineQuery = Prisma.defineExtension({
    query: {
        user: {
            async $allOperations({ model, operation, args, query }) {
                if (['create', 'update'].includes(operation) && args.data['password']) {
                    args.data['password'] = bycrypt.hashSync(args.data['password'], 10)
                }
                return query(args)
            }
        },
    }
})

const defineModel = Prisma.defineExtension({
    model: {
        user: {
            async login(username, password) {
                let user = await prisma.user.findUnique({
                    where: {
                        username
                    }
                })
                if (!user) {
                    return null
                }
                else {
                    if (bycrypt.compareSync(password, user.password)) {
                        return user
                    }
                }
            },
        },
    },
})
export const prisma = new PrismaClient().$extends(defineModel).$extends(defineQuery)