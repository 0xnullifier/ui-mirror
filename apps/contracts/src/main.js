import { computeRootProgram } from "circuits/src/circuit.js";
import { NetZeroVerifier } from "./NetZero.js";
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = "/Users/utkarshdagoat/dev/NetZero/ORAM-SMST/proto/smt.proto"

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const smtProto = grpc.loadPackageDefinition(packageDefinition).smt
await computeRootProgram.compile()


function call() {
    const cleint = new smtProto.SMTBackend("[::1]:50051", grpc.credentials.createInsecure())
    let user = "a9shgh5zim@gmail.com"
    let output
    cleint.GenerateProof({ user_email: user, fetch_root: true, fetch_user_node: true }, (err, resp) => {
        const path = resp.path.map((ele) => DeserialiseProofs.nodeContentFromBuffer(ele.commitment, ele.hash));
        for (let index = path.length; index < 32; index++) {
            path.push(NodeContent.zero())
        }
        const lefts = resp.lefts.map((ele) => Bool.fromValue(ele))
        for (let index = lefts.length; index < 32; index++) {
            lefts.push(Bool(false))
        }
        const root = (resp?.root) ? DeserialiseProofs.nodeContentFromBuffer(resp.root.commitment, resp.root.hash) : undefined;
        const userLeaf = (resp?.userNode) ? DeserialiseProofs.nodeContentFromBuffer(resp.userNode.commitment, resp.userNode.hash) : undefined;
        output = { witness: new MerkleWitness({ path, lefts }), root, userLeaf, masterSalt: resp.masterSalt }
    })
    return output
}


const useProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;


// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new NetZeroVerifier(zkAppAddress)
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    // 1 Mina fee is required to create a new account for the zkApp
    // This line means the deployer account will pay the fee for any account created in this transaction
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
const output = call()
const { proof } = await computeRootProgram.computeRoot(output.witness, output.userLeaf)
proof.verify()
