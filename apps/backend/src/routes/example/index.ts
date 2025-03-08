import { FastifyPluginAsync } from "fastify"

const api: FastifyPluginAsync = async (fastify, opts): Promise<void> => {


  fastify.get('/', async function (request, reply) {
    return 'this is an api'
  })

  fastify.post<{
    Body: {

    }
  }>('/register-custodian', async function (request, reply) {

  })
}

export default api;
