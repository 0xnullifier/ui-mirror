import { Field, Group, method, Provable, SmartContract, State, state } from "o1js";
import { computeRootProof } from "circuits/src/circuit"

export class NetZeroVerifier extends SmartContract {
    @state(Field) rootHash = State<Field>()
    @state(Group) rootCommitment = State<Group>()
    @state(Field) saltS = State<Field>()
    @state(Field) saltB = State<Field>()

    @method async setPublicParameters(saltS: Field, saltB: Field) {
        this.saltB.set(saltB)
        this.saltS.set(saltS)
    }

    @method async setRoot(rootHash: Field, rootCommitment: Group) {
        this.rootHash.set(rootHash)
        this.rootCommitment.set(rootCommitment)
    }

    @method async verifySolvency(proof: computeRootProof) {
        proof.verify()
        const computedRoot = proof.publicOutput;
        computedRoot.hash.assertEquals(this.rootHash.get())
        computedRoot.commitment.assertEquals(this.rootCommitment.get())
    }
}