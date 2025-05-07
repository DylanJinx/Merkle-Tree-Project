import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";
import path from "path";

const whitelist: string[] = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x8b21fdA29C98c394F346AdEbC852d041f757Da7a",
];

// keccak256(abi.encodePacked(address))
const leaves = whitelist.map((addr) =>
  keccak256(Buffer.from(addr.toLowerCase().slice(2), "hex"))
);

console.log(
  "Leaves:",
  leaves.map((leaf) => "0x" + leaf.toString("hex"))
);

const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

const root = tree.getHexRoot();
console.log("\nMerkle Root:", root, "\n");

// 为每个地址生成 proof
const proofs: Record<string, string[]> = {};
whitelist.forEach((addr, i) => {
  proofs[addr.toLowerCase()] = tree.getHexProof(leaves[i]);
});

const outPath = path.resolve(__dirname, "proofs.json");
fs.writeFileSync(outPath, JSON.stringify(proofs, null, 2));
console.log(`Proofs saved to ${outPath}`);
