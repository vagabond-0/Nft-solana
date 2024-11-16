import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createGenericFile, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { promises as fs } from "fs";
import { clusterApiUrl,Keypair } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));


const localkeypair = getKeypairFromFile();


const umiKeypair = umi.eddsa.createKeypairFromSecretKey(localkeypair.secretKey);

umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

let filePath = "nft.jpg";
let buffer = await fs.readFile(filePath);
let file = createGenericFile(buffer,filePath,{
    contentType:"image/jpeg",
});

const [image] = await umi.uploader.upload([file])
const uri = await umi.uploader.uploadJson({
    name:"vagabond",
    description:"vagabond nft",
    image,https://chatgpt.com/c/673877b8-3744-800f-ad6b-e3d4e82b4960
  });

  const mint = Keypair.generate();
  const { signature, result } = await createNft(umi, {
    mint:mint.publicKey,
    name: "My NFT",
    uri,
    updateAuthority: umi.identity.publicKey,
    sellerFeeBasisPoints: percentAmount(0),
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });