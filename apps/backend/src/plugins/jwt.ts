import fp from 'fastify-plugin';
import fastifyjwt from '@fastify/jwt';
import { config } from '../config.js';
import { FastifyRequest } from 'fastify';

export default fp<{}>(async function (fastify, opts) {
    fastify.register(fastifyjwt, {
        secret: config.JWT_SECRET
    })

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: any) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.send(err)
        }
    })
})