import grpc from "@grpc/grpc-js"
import protoLoader from "@grpc/proto-loader"
import { DeserialiseProofs } from "circuits/dist/src/deserialise_proofs.js"
import { ProtoGrpcType } from "../proto/smt"
import { SMTBackendClient } from "../proto/smt/SMTBackend"
import { MerkleWitness, NodeContent } from "circuits/dist/src/types.js"
import { Bool } from "o1js"

interface GenProofOutput {
    witness: MerkleWitness,
    userLeaf?: NodeContent,
    root?: NodeContent,
    masterSalt: Buffer
}

export class GrpcCaller {
    public url = ""
    client: SMTBackendClient

    constructor(_url: string) {
        this.url = _url
        const PROTO_PATH = "/Users/utkarshdagoat/dev/NetZero/core/circuits/apps/backend/proto/smt.proto"
        const packageDefinition = protoLoader.loadSync(
            PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        const smtProto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
        smtProto.smt.RequestProof
        this.client = new smtProto.smt.SMTBackend(_url, grpc.credentials.createInsecure())
    }

    async generateProof(
        userEmail: string,
        fetchRoot: boolean,
        fetchUserNode: boolean
    ): Promise<GenProofOutput> {
        let output: any;
        this.client.GenerateProof({ userEmail: userEmail, fetchRoot: fetchRoot, fetchUserNode: fetchUserNode }, (err, res) => {
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
        return output
    }

    async setUserRecord(
        userEmail: string,
        balances: number[],
    ) {
        this.client.SetUserData({ userName: userEmail, balances: balances }, (err, res) => {
            if (res?.msg !== "Saved Succesfully") {
                throw new Error("Did not save")
            }
        })
    }
}