import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}


export default fp(async (server, options) => {
    const prisma = new PrismaClient()
    server.decorate('prisma', prisma);
    await prisma.$connect();
    server.addHook('onClose', async (server) => {
        await server.prisma.$disconnect();
    })

}, { name: 'prisma', dependencies: ['config'] });