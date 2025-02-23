import fastify, { FastifyRequest } from 'fastify'
import { GrpcCaller } from './grpc.js' // Adjust path as needed
import { DeserialiseProofs } from 'circuits/dist/src/deserialise_proofs.js';
import { NodeContent, MerkleWitness } from 'circuits/dist/src/types.js';
import { Bool } from 'o1js';

// Define query parameter interfaces
interface GenerateProofQuery {
    userEmail: string;
    fetchRoot?: string;
    fetchUserNode?: string;
}

interface SetUserRecordQuery {
    userEmail: string;
    balances: string; // Will be parsed as comma-separated numbers
}

// Create server instance
const server = fastify();

// Initialize GRPC client
const grpcClient = new GrpcCaller('[::1]:50051'); // Adjust URL as needed

// Define routes
server.get<{
    Querystring: GenerateProofQuery
}>('/generateProof', async (request, reply) => {
    try {
        const { userEmail, fetchRoot, fetchUserNode } = request.query;
        console.log(userEmail)
        // Convert string parameters to boolean
        const fetchRootBool = fetchRoot === 'true';
        const fetchUserNodeBool = fetchUserNode === 'true';
        let output: any
        grpcClient.client.GenerateProof({ userEmail: userEmail, fetchRoot: fetchRootBool, fetchUserNode: fetchUserNodeBool }, (err, res) => {
            if (err) {
                throw err
            }
            const path = res!.path.map((ele) => DeserialiseProofs.nodeContentFromBuffer(ele.commitment, ele.hash));
            for (let index = path.length; index < 32; index++) {
                path.push(NodeContent.zero())
            }
            const lefts = res!.lefts.map((ele) => Bool.fromValue(ele))
            for (let index = lefts.length; index < 32; index++) {
                lefts.push(Bool(false))
            }
            const root = (res?.root) ? DeserialiseProofs.nodeContentFromBuffer(res.root.commitment, res.root.hash) : undefined;
            const userLeaf = (res?.userNode) ? DeserialiseProofs.nodeContentFromBuffer(res.userNode.commitment, res.userNode.hash) : undefined;
            output = { witness: new MerkleWitness({ path, lefts }), root, userLeaf, masterSalt: res!.masterSalt }
        })
        return {
            success: true,
            data: JSON.stringify(output)
        };
    } catch (error) {
        console.error('Error generating proof:', error);
        reply.status(500).send({
            success: false,
            error: 'Failed to generate proof'
        });
    }
});

server.post<{
    Querystring: SetUserRecordQuery
}>('/setUserRecord', async (request, reply) => {
    try {
        const { userEmail, balances } = request.query;

        // Parse balances from comma-separated string to number array
        const balancesArray = balances.split(',').map(Number);

        // Validate balances
        if (balancesArray.some(isNaN)) {
            reply.status(400).send({
                success: false,
                error: 'Invalid balances format. Please provide comma-separated numbers.'
            });
            return;
        }

        await grpcClient.setUserRecord(userEmail, balancesArray);

        return {
            success: true,
            message: 'User record set successfully'
        };
    } catch (error) {
        console.error('Error setting user record:', error);
        reply.status(500).send({
            success: false,
            error: 'Failed to set user record'
        });
    }
});

// Error handler
server.setErrorHandler((error, request, reply) => {
    console.error('Server error:', error);
    reply.status(500).send({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const start = async () => {
    try {
        await server.listen({ port: 8080, host: '0.0.0.0' });
        console.log('Server listening on port 8080');
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

start();