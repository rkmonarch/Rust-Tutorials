import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import fs from 'mz/fs';
  import path from 'path';


//make a const to point at our keypair json file

const PROGRAM_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../dist/program'),
    'rust_tutorial-keypair.json'
);

async function main() {
    console.log("Launching client.....");

    //connect to Solana DEVNET

    let connection = new Connection("https://api.devnet.solana.com", 'confirmed');
    
    //get our programs public key

    const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH,{encoding:'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const programKeypair = Keypair.fromSecretKey(secretKey);
    let programId: PublicKey = programKeypair.publicKey;

    //Generate an account (keypair) to transact with our program

    const triggerKeypair = Keypair.generate();
    const airdropRequest = await connection.requestAirdrop(
        triggerKeypair.publicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropRequest);

    //conduct a transaction with our program

    console.log("Pinging Program", programId.toBase58());
    const instruction = new TransactionInstruction({
        keys: [{
            pubkey: triggerKeypair.publicKey, isSigner:false, isWritable:true
        }],
        programId,
        data: Buffer.alloc(0),
    });
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [triggerKeypair],
    );
}

main().then(
    () => process.exit(),
    err => {
        console.log(err);
        process.exit(-1);
    },
);

