import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, irysStorage, toBigNumber, CreateCandyMachineInput, DefaultCandyGuardSettings, toDateTime, sol } from "@metaplex-foundation/js";
import fs from 'fs';

const QUICKNODE_RPC = 'https://old-summer-owl.solana-devnet.quiknode.pro/cb027022e5b1c5657d7d11ea045506df196be711';
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC, { commitment: 'finalized' });


const PRIVATE_KEY_PATH = "/home/amalendum/.config/solana/devnet.json"; 
const privateKey = JSON.parse(fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8'));
const WALLET = Keypair.fromSecretKey(new Uint8Array(privateKey));

// Initialize Metaplex
const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
    .use(keypairIdentity(WALLET))
    .use(irysStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: QUICKNODE_RPC,
        timeout: 60000,
    }));
    async function generateCandyMachine() {
        const candyMachineSettings: CreateCandyMachineInput<DefaultCandyGuardSettings> =
            {
                itemsAvailable: toBigNumber(3), // Collection Size: 3
                sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
                symbol: "DEMO",
                maxEditionSupply: toBigNumber(0), // 0 reproductions of each NFT allowed
                isMutable: true,
                creators: [
                    { address: WALLET.publicKey, share: 100 },
                ],
                collection: {
                    address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
                    updateAuthority: WALLET,
                },
            };
        const { candyMachine } = await METAPLEX.candyMachines().create(candyMachineSettings);
        console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
        console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);
    }

async function createCollectionNft() {
    const { nft: collectionNft } = await METAPLEX.nfts().create({
        name: "QuickNode Demo NFT Collection",
        uri: 'https://mfp2m2qzszjbowdjl2vofmto5aq6rtlfilkcqdtx2nskls2gnnsa.arweave.net/YV-mahmWUhdYaV6q4rJu6CHozWVC1CgOd9NkpctGa2Q',
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: WALLET,
    });

    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);
}
async function updateCandyMachine() {
    const candyMachine = await METAPLEX
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) });

    const { response } = await METAPLEX.candyMachines().update({
        candyMachine,
        guards: {
            startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
            mintLimit: {
                id: 1,
                limit: 2,
            },
            solPayment: {
                amount: sol(0.1),
                destination: METAPLEX.identity().publicKey,
            },
        }
    })
    
    console.log(`✅ - Updated Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

async function addItems() {
    const candyMachine = await METAPLEX
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) }); 
    const items = [];
    for (let i = 0; i < 3; i++ ) { // Add 3 NFTs (the size of our collection)
        items.push({
            name: `QuickNode Demo NFT # ${i+1}`,
            uri: "https://mfp2m2qzszjbowdjl2vofmto5aq6rtlfilkcqdtx2nskls2gnnsa.arweave.net/YV-mahmWUhdYaV6q4rJu6CHozWVC1CgOd9NkpctGa2Q"
        })
    }
    const { response } = await METAPLEX.candyMachines().insertItems({
        candyMachine,
        items: items,
      },{commitment:'finalized'});

    console.log(`✅ - Items added to Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}


const COLLECTION_NFT_MINT = 'GuiWAxA4Zd3YmoFDLSeStk1sofWq7iPgmVu7msYHj7Bg';
const CANDY_MACHINE_ID = 'H2VcYniDLBwFVBoBBX9nHTecdso9KoDozPdFu999bsCd';

async function mintNft() {
    const candyMachine = await METAPLEX
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) }); 
    let { nft, response } = await METAPLEX.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: WALLET.publicKey,
        },{commitment:'finalized'})

    console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

mintNft();
// addItems();