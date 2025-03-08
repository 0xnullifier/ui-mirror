import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { FastifyInstance } from 'fastify';

// Define the schema interface
export interface EnvConfig {
    PORT: number;
    DATABASE_URL: string;
}

const schema = {
    type: 'object',
    required: ['PORT', 'DATABASE_URL'],
    properties: {
        PORT: {
            type: 'number',
            default: 3000
        },
        DATABASE_URL: {
            type: 'string',
        }
    }
};

const options = {
    confKey: 'config', // This will attach your config to fastify instance
    schema: schema,
    data: process.env // Load env vars from process.env
};

export default fp<{}>(async (fastify: FastifyInstance) => {
    await fastify.register(fastifyEnv, options);

    // Type augmentation to add config property to FastifyInstance
    // This makes TypeScript recognize fastify.config
}, { name: 'config' });


declare module 'fastify' {
    interface FastifyInstance {
        config: EnvConfig;
    }
}