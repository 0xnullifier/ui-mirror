import { FastifyPluginAsync } from "fastify"



const api: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get("/exchanges", async function (request, reply) {
    const exchanges = (await fastify.prisma.custodian.findMany()).map((exchange) => {
      return {
        name: exchange.name,
        logo: exchange.logo,
        backendurl: exchange.backendurl,
      }
    })
    if (!exchanges) {
      return reply.status(404).send({ message: "Exchanges not found" })
    }
    return reply.status(200).send({ message: "Exchanges fetched successfully", exchanges })
  })

  fastify.post("/exchange/register", async function (request, reply) {
    const { name, logo, backendurl } = request.body as { name: string, logo: string, backendurl: string }

    const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (!name) {
      return reply.status(400).send({ message: "Name is required" })
    }
    if (!logo) {
      return reply.status(400).send({ message: "Url is required" })
    }
    if (!backendurl) {
      return reply.status(400).send({ message: "Backend URL is required" })
    }

    const exchange = await fastify.prisma.custodian.create({
      data: {
        name,
        logo,
        backendurl,
        apiKey
      }
    })
    return reply.status(200).send({ message: "Exchange created successfully", exchange })
  })

  fastify.post("/exchange/update", async function (request, reply) {
    const { id, backendurl } = request.body as { id: number, backendurl: string }
    const apiKey = request.headers["x-api-key"] as string;

    if (!apiKey) {
      return reply.status(401).send({ message: "API key is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id,
        apiKey
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Invalid API key or custodian not found" })
    }

    if (!id) {
      return reply.status(400).send({ message: "Id is required" })
    }
    if (!backendurl) {
      return reply.status(400).send({ message: "Backend URL is required" })
    }

    const exchange = await fastify.prisma.custodian.update({
      where: {
        id
      },
      data: {
        backendurl
      }
    })
    return reply.status(200).send({ message: "Exchange updated successfully", exchange })
  })


  fastify.get("/exchanges/:id/analytics", async function (request, reply) {
    const { id } = request.params as { id: string }
    const analytics = await fastify.prisma.proofAnalytics.findMany({
      where: {
        custodianId: Number(id)
      }
    })
    if (!analytics) {
      return reply.status(404).send({ message: "Analytics not found" })
    }
    return reply.status(200).send({ message: "Analytics fetched successfully", analytics })
  })

}

export default api;
