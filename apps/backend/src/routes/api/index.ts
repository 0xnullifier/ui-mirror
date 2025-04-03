import { FastifyPluginAsync } from "fastify"



const api: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get("/exchanges", async function (request, reply) {
    const exchanges = (await fastify.prisma.custodian.findMany()).map((exchange: any) => {
      return {
        name: exchange.name,
        logo: exchange.logo,
        backendurl: exchange.backendurl,
        liabilitiesZkAppAddress: exchange.liabilitiesZkAppAddress,
        assetsZkAppAddress: exchange.assetsZkAppAddress,
        posZkAppAddress: exchange.posZkAppAddress,
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

  // fastify.post("/exchange/contract", async function (request, reply) {
  //   const { id, liabilitiesZkAppAddress, assetsZkAppAddress, posZkAppAddress } = request.body as { id: number, liabilitiesZkAppAddress: string, assetsZkAppAddress: string, posZkAppAddress: string }
  //   const apiKey = request.headers["x-api-key"] as string;
  //   if (!apiKey) {
  //     return reply.status(401).send({ message: "API key is required" })
  //   }
  //   const custodian = await fastify.prisma.custodian.findFirst({
  //     where: {
  //       id,
  //       apiKey
  //     }
  //   })
  //   if (!custodian) {
  //     return reply.status(403).send({ message: "Invalid API key or custodian not found" })
  //   }
  //   if (!id) {
  //     return reply.status(400).send({ message: "Id is required" })
  //   }
  //   if (!liabilitiesZkAppAddress) {
  //     return reply.status(400).send({ message: "Liabilities zkApp address is required" })
  //   }
  //   if (!assetsZkAppAddress) {
  //     return reply.status(400).send({ message: "Assets zkApp address is required" })
  //   }
  //   if (!posZkAppAddress) {
  //     return reply.status(400).send({ message: "POS zkApp address is required" })
  //   }
  //   const exchange = await fastify.prisma.custodian.update({
  //     where: {
  //       id
  //     },
  //     data: {
  //       liabilitiesZkAppAddress,
  //       assetsZkAppAddress,
  //       posZkAppAddress
  //     }
  //   })
  //   return reply.status(200).send({ message: "Exchange updated successfully", exchange })
  // })

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
    const analytics = await fastify.prisma.anaytics.findMany({
      where: {
        custodianId: Number(id)
      }
    })
    if (!analytics) {
      return reply.status(404).send({ message: "Analytics not found" })
    }
    return reply.status(200).send({ message: "Analytics fetched successfully", analytics })
  })

  fastify.post('/exchanges/:id/round/liabilities/start', async function (request, reply) {
    const { id } = request.params as { id: string }
    const apiKey = request.headers["x-api-key"] as string;

    if (!apiKey) {
      return reply.status(401).send({ message: "API key is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: Number(id),
        apiKey
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Invalid API key or custodian not found" })
    }

    // create a new round
    const round = await fastify.prisma.round.create({
      data: {
        custodianId: Number(id),
      }
    })
    if (!round) {
      return reply.status(500).send({ message: "Round not created" })
    }
    return reply.status(200).send({ message: "Round created successfully", round })
  })

  fastify.post('/exchanges/:id/round/liabilities/end', async function (request, reply) {
    const { id, } = request.params as { id: string, roundId: string }
    const { endTime, txnUrl } = request.body as { endTime: string, txnUrl: string }
    const apiKey = request.headers["x-api-key"] as string;

    if (!apiKey) {
      return reply.status(401).send({ message: "API key is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: Number(id),
        apiKey
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Invalid API key or custodian not found" })
    }

    // get the last round
    const round = await fastify.prisma.round.findFirst({
      where: {
        custodianId: Number(id),
      },
      orderBy: {
        startingTimeStamp: 'desc',
      }
    })

    if (!round) {
      return reply.status(404).send({ message: "Round not found" })
    }

    // update the round
    const updatedRound = await fastify.prisma.round.update({
      where: {
        id: round.id
      },
      data: {
        liabilitiesEndTimeStamp: new Date(endTime),
        liabilityTxUrl: txnUrl,
      }
    })
    return reply.status(200).send({ message: "Round updated successfully", updatedRound })
  })


  fastify.post('/exchanges/:id/round/assets/end', async function (request, reply) {
    const { id, } = request.params as { id: string, }

    const { endTime, txnUrl } = request.body as { endTime: string, txnUrl: string }
    const apiKey = request.headers["x-api-key"] as string;

    if (!apiKey) {
      return reply.status(401).send({ message: "API key is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: Number(id),
        apiKey
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Invalid API key or custodian not found" })
    }

    // create a new round
    const latestRound = await fastify.prisma.round.findFirst({
      where: {
        custodianId: Number(id),
      },
      orderBy: {
        startingTimeStamp: 'desc',
      }
    });

    if (!latestRound) {
      return reply.status(400).send({ message: "A round is not started yet" });
    }

    // update the round
    const updatedRound = await fastify.prisma.round.update({
      where: {
        id: latestRound.id
      },
      data: {
        assetEndTimeStamp: new Date(endTime),
        assetTxUrl: txnUrl,
      }
    })
    return reply.status(200).send({ message: "Round updated successfully", updatedRound })
  })


  fastify.post('/exchanges/:id/round/solvency/end', async function (request, reply) {
    const { id } = request.params as { id: string, }
    const { endTime, txnUrl } = request.body as { endTime: string, txnUrl: string }
    const apiKey = request.headers["x-api-key"] as string;

    if (!apiKey) {
      return reply.status(401).send({ message: "API key is required" })
    }

    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: Number(id),
        apiKey
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Invalid API key or custodian not found" })
    }

    // create a new round
    const latestRound = await fastify.prisma.round.findFirst({
      where: {
        custodianId: Number(id),
      },
      orderBy: {
        startingTimeStamp: 'desc',
      }
    });

    if (!latestRound) {
      return reply.status(400).send({ message: "A round is not started yet" });
    }

    // update the round
    const updatedRound = await fastify.prisma.round.update({
      where: {
        id: latestRound.id
      },
      data: {
        solvencyEndTimeStamp: new Date(endTime),
        solvencyTxUrl: txnUrl,
      }
    })
    return reply.status(200).send({ message: "Round updated successfully", updatedRound })
  })


  fastify.get('/exchanges/:id/rounds', async function (request, reply) {
    const { id } = request.params as { id: string }


    const custodian = await fastify.prisma.custodian.findFirst({
      where: {
        id: Number(id),
      }
    })

    if (!custodian) {
      return reply.status(403).send({ message: "Custodian not found" })
    }

    const rounds = await fastify.prisma.round.findMany({
      where: {
        custodianId: Number(id)
      }
    })
    if (!rounds) {
      return reply.status(404).send({ message: "Rounds not found" })
    }
    return reply.status(200).send({ message: "Rounds fetched successfully", rounds })
  })

}

export default api;
