import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// ── 1. 读取 CLI 参数 ────────────────────────────────────────────────
const newRoot = process.argv[2];
if (!newRoot || !/^0x[0-9a-fA-F]{64}$/.test(newRoot)) {
  console.error("ERROR: 请在命令行传入合法的 0x + 64 位 hex Merkle Root");
  process.exit(1);
}

// ── 2. 环境变量 ────────────────────────────────────────────────────
const { PRIVATE_KEY, SEPOLIA_RPC_URL, CONTRACT_ADDR } = process.env;
if (!PRIVATE_KEY || !SEPOLIA_RPC_URL || !CONTRACT_ADDR) {
  throw new Error(
    "ERROR: 请在 .env 中配置 PRIVATE_KEY / SEPOLIA_RPC_URL / CONTRACT_ADDR"
  );
}

// ── 3. Provider & Signer ──────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ── 4. 读取 ABI（Foundry 输出） ───────────────────────────────────
const abiPath = path.resolve("out", "MerkleApp.sol", "MerkleApp.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;

// ── 5. 连接合约并调用 setRoot ─────────────────────────────────────
async function main() {
  const contract = new ethers.Contract(CONTRACT_ADDR!, abi, wallet);

  console.log("Owner wallet:      ", wallet.address);
  console.log("Contract address:  ", CONTRACT_ADDR);
  console.log("New merkleRoot:    ", newRoot);

  const gas = await contract.setRoot.estimateGas(newRoot);
  console.log("Estimated gas:     ", gas.toString());

  const tx = await contract.setRoot(newRoot);
  console.log("Tx sent:           ", tx.hash);
  const receipt = await tx.wait();
  console.log("SUCCESS: Root updated in block", receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
