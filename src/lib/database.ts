import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const defineQuery = Prisma.defineExtension({
  query: {
    user: {
      async $allOperations({ operation, args, query }) {
        // Sólo interceptar create/update donde existe data
        if ((operation === 'create' || operation === 'update') && (args as any)?.data) {
          const data = (args as any).data;
          if ('password' in data && data.password) {
            data.password = bcrypt.hashSync(data.password, 10);
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

// Export as PrismaClient type to satisfy repositories' constructors
export const prisma: PrismaClient = (new PrismaClient().$extends(defineModel).$extends(defineQuery) as unknown) as PrismaClient;