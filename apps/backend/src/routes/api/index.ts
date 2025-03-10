import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import apiKeys from "../../valid_keys.json" with { type: "json" };

const verifyClient = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || !Object.values(apiKeys).includes(apiKey.toString())) {
    return reply.status(403).send({ error: 'Access denied: Invalid API Key' });
  }
};

const api: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get("/exchanges", async function (request, reply) {
    const exchanges = await fastify.prisma.custodian.findMany()
    return exchanges
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
  fastify.post("/verifyuser", { preHandler: verifyClient }, async function (request, reply) {

    const { email, cexId } = request.body as { email: string, cexId: number }

    if (!email) {
      return reply.status(400).send({ message: "Email is required" })
    }
    if (!cexId) {
      return reply.status(400).send({ message: "CexId is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: cexId
      }
    })
    if (!custodian) {
      return reply.status(404).send({ message: "CexId not found" })
    }
    const user = await fastify.prisma.user.findFirst({
      where: {
        email
      }
    })
    if (!user) {
      return reply.status(404).send({ message: "User not found" })
    }

    const userCustodian = await fastify.prisma.userCustodian.create({
      data: {
        userId: user.id,
        custodianId: custodian.id
      }
    })
    return reply.status(200).send({ message: "User verified successfully", userCustodian })
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

  fastify.get("/user/:email/exchanges", async function (request, reply) {
    const { email } = request.params as { email: string }
    const user = await fastify.prisma.user.findFirst({
      where: {
        email
      }
    })
    if (!user) {
      return reply.status(404).send({ message: "User not found" })
    }

    const userCustodian = await fastify.prisma.userCustodian.findMany({
      where: {
        userId: user.id
      },
      include: {
        custodian: true
      }
    })
    if (!userCustodian) {
      return reply.status(404).send({ message: "User Custodian not found" })
    }
    return reply.status(200).send({ message: "User Custodian fetched successfully", userCustodian })
  })

}

export default api;
