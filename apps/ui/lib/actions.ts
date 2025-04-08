import axios from "axios";
import { CUSTODIAN_INCLUSION_PROOFS } from "./endpoint";
import { Custodian } from "./store";
import { fetchAccount, Field, PublicKey, Group, Bool, Mina } from "o1js";
import { NetZeroLiabilitiesVerifier } from "@netzero/contracts";
import { InclusionProofProgram, NodeContent, rangeCheckProgram, MerkleWitness, UserParams } from "@netzero/circuits";
import { TableData } from "./types";
import { useToast } from "@/lib/hooks/useToast"


export function hash(string: string) {
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