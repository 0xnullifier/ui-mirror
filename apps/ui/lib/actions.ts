import axios from "axios";
import { CUSTODIAN_INCLUSION_PROOFS } from "./endpoint";
import { Custodian } from "./store";
import { fetchAccount, Field, PublicKey, Group, Bool, Mina } from "o1js";
import { NetZeroLiabilitiesVerifier } from "@netzero/contracts";
import { InclusionProofProgram, NodeContent, rangeCheckProgram, MerkleWitness, UserParams } from "@netzero/circuits";
import { TableData } from "./types";
import { useToast } from "@/lib/hooks/useToast"
export const handleGenerateAndVerify = async (exchange: Custodian, tableData: TableData[]) => {
    const { toast } = useToast();

    try {
        const userId = BigInt('0x' + await hash("")).toString();
        const result = await axios.post(CUSTODIAN_INCLUSION_PROOFS(exchange.backendurl), {
            userId
        });

        const { account, error } = await fetchAccount({ publicKey: PublicKey.fromBase58(exchange.liabilitiesZkAppAddress) });
        if (error) {
            console.error("Error fetching account:", error);
            toast({
                title: "Error",
                description: "Error fetching account: " + error.statusText,
                variant: "error",
            });
            return;
        }

        const zkApp = new NetZeroLiabilitiesVerifier(PublicKey.fromBase58(exchange.liabilitiesZkAppAddress));

        console.time("range check program");
        await rangeCheckProgram.compile();
        console.timeEnd("range check program");
        console.time("Inclusion proof program compile");
        await InclusionProofProgram.compile();
        console.timeEnd("Inclusion proof program compile");
        console.time("contract compile");
        await NetZeroLiabilitiesVerifier.compile();
        console.timeEnd("contract compile");

        let path: NodeContent[] = result.data.proof.path.map((p: { commitment: { x: string, y: string }, hash: string }) => {
            return new NodeContent({ commitment: Group.fromJSON(p.commitment), hash: Field.fromJSON(p.hash) });
        });
        for (let i = path.length; i < 32; i++) {
            path.push(new NodeContent({ commitment: Group.zero, hash: Field(0) }));
        }
        let lefts = result.data.proof.lefts.map((l: boolean) => Bool.fromValue(l));
        for (let i = lefts.length; i < 32; i++) {
            lefts.push(Bool.fromValue(false));
        }

        const merkleWitness = new MerkleWitness({
            path,
            lefts
        });

        const blindingFactor = Field(result.data.blindingFactor);
        const userSecret = Field(result.data.userSecret);

        const relevantEntries = tableData
            ///@ts-ignore
            .filter(entry => entry.company.props.name === exchange.name);
        console.log(relevantEntries);
        const balances = relevantEntries
            .map(entry => Field(BigInt(Math.floor(Number(entry.equity)))));
        for (let i = balances.length; i < 100; i++) {
            balances.push(Field(0));
        }

        const userParams = new UserParams({
            balances,
            blindingFactor,
            userSecret,
            userId: Field(userId),
        });

        console.log(userParams);

        console.time("generating proof new");
        // generate proof
        const { proof } = await InclusionProofProgram.inclusionProof(merkleWitness, userParams);
        console.timeEnd("generating proof new");

        try {
            // Retrieve Mina provider injected by browser extension wallet
            const mina = (window as any).mina;
            const walletKey: string = (await mina.requestAccounts())[0];
            console.log("Connected wallet address: " + walletKey);
            await fetchAccount({ publicKey: PublicKey.fromBase58(walletKey) });

            const transaction = await Mina.transaction(async () => {
                console.log("Executing zkApp.verifyInclusion() locally");
                await zkApp.verifyInclusion(proof);
            });

            // Prove execution of the contract using the proving key
            await transaction.prove();

            // Broadcast the transaction to the Mina network
            console.log("Broadcasting proof of execution to the Mina network");
            const { hash } = await mina.sendTransaction({ transaction: transaction.toJSON() });

            // Display the link to the transaction
            const transactionLink = "https://minascan.io/devnet/tx/" + hash;
            toast({
                title: "Success",
                description: `Transaction broadcasted successfully. View it here: ${transactionLink}`,
                variant: "success",
            });
        } catch (e: any) {
            console.error(e.message);
            let errorMessage = "";

            if (e.message.includes("Cannot read properties of undefined (reading 'requestAccounts')")) {
                errorMessage = "Is Auro installed?";
            } else if (e.message.includes("Please create or restore wallet first.")) {
                errorMessage = "Have you created a wallet?";
            } else if (e.message.includes("User rejected the request.")) {
                errorMessage = "Did you grant the app permission to connect?";
            } else {
                errorMessage = "An unknown error occurred.";
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "error",
            });
        }
    } catch (error: any) {
        console.error(error.message);
        toast({
            title: "Error",
            description: "An error occurred: " + error.message,
            variant: "error",
        });
    }
};


function hash(string: string) {
    const utf8 = new TextEncoder().encode(string);
    return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((bytes) => bytes.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    });
}

async function bigintToBuffer(value: bigint): Promise<ArrayBuffer> {
    const hex = value.toString(16).padStart(64, '0'); // Ensure 32 bytes (64 hex chars)
    return Uint8Array.from(Buffer.from(hex, 'hex')).buffer;
}

function bufferToBigInt(buffer: ArrayBuffer): bigint {
    return BigInt('0x' + Buffer.from(buffer).toString('hex'));
}

// attempt at porting the functionaliy of hkdf from the tree code
async function hkdf(
    ikm: bigint,
    salt: bigint | null,
    info: bigint | null
): Promise<bigint> {
    if (salt === null && info === null) {
        throw new Error('Salt and info cannot both be null');
    }

    const ikmBuffer = await bigintToBuffer(ikm);
    const saltBuffer = salt ? await bigintToBuffer(salt) : new Uint8Array(32).buffer;
    const infoBuffer = info ? await bigintToBuffer(info) : new Uint8Array(0).buffer;

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        ikmBuffer,
        { name: 'HKDF' },
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: saltBuffer,
            info: infoBuffer,
        },
        keyMaterial,
        256 // 32 bytes (256 bits)
    );

    return bufferToBigInt(derivedBits);
} 