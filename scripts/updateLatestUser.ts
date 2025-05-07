// 直接在.env读取user的私钥

import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const proofsPath = path.resolve(__dirname, "proofs.json");
const proofs: Record<string, string[]> = JSON.parse(
  fs.readFileSync(proofsPath, "utf8")
);

/* ──────────── 1. 环境变量 ──────────── */

const { USER_PRIVATE_KEY, SEPOLIA_RPC_URL, CONTRACT_ADDR } = process.env;

const PK = USER_PRIVATE_KEY;
if (!PK || !SEPOLIA_RPC_URL || !CONTRACT_ADDR) {
  throw new Error(
    "ERROR: .env 缺少 USER_PRIVATE_KEY、SEPOLIA_RPC_URL 或 CONTRACT_ADDR"
  );
}

/* ──────────── 2. Provider & Wallet ──────────── */

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PK, provider);
const userAddr = wallet.address.toLowerCase();

console.log("Using wallet :", wallet.address);

/* ──────────── 3. 取 proof ──────────── */

const proof: string[] | undefined = (proofs as Record<string, string[]>)[
  userAddr
];
if (!proof) {
  throw new Error(
    `ERROR: 地址 ${wallet.address} 不在 proofs.json，无法调用 updateLatestUser`
  );
}
console.log("Proof length :", proof.length);

/* ──────────── 4. 读取 ABI & 合约实例 ──────────── */

const abiPath = path.resolve("out", "MerkleApp.sol", "MerkleApp.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;

const contract = new ethers.Contract(CONTRACT_ADDR!, abi, wallet);

/* ──────────── 5. 发送交易 ──────────── */

async function main() {
  const gas = await contract.updateLatestUser.estimateGas(proof);
  console.log("Estimated gas:", gas.toString());

  const tx = await contract.updateLatestUser(proof);
  console.log("Tx sent      :", tx.hash);

  const receipt = await tx.wait();
  console.log("SUCCESS: Mined in block", receipt.blockNumber);

  const latest = await contract.latest_user();
  console.log("\n latest_user   :", latest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
