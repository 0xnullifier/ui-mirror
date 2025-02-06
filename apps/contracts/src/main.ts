import { NetZeroVerifier } from "./NetZero.js";
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

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
