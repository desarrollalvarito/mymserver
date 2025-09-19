import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const defineQuery = Prisma.defineExtension({
  query: {
    user: {
      async $allOperations({ model, operation, args, query }) {
        if (['create', 'update'].includes(operation) && args.data && 'password' in args.data) {
          const password = (args.data as any).password;
          if (password) {
            (args.data as any).password = bcrypt.hashSync(password, 10);
          }
        }
        return query(args);
      }
    },
  }
});

const defineModel = Prisma.defineExtension({
  model: {
    user: {
      async login(username: string, password: string) {
        const prisma = new PrismaClient();
        try {
          const user = await prisma.user.findUnique({
            where: { username }
          });

          if (!user) {
            return null;
          }

          if (bcrypt.compareSync(password, user.password)) {
            return {
              id: user.id,
              username: user.username,
              email: user.email
            };
          }

          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    },
  },
});

export const prisma = new PrismaClient().$extends(defineModel).$extends(defineQuery);