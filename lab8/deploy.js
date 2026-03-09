import { ethers, NonceManager } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

// Загружаем переменные окружения из .env
dotenv.config();

async function main() {
  // ===== Provider из .env =====
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  
  // ===== Wallet из .env =====
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // ===== NonceManager =====
  const account = new NonceManager(wallet);
  
  // ===== Чтение ABI и bytecode =====
  const abi = JSON.parse(fs.readFileSync("./contracts_Note_sol_Note.abi", "utf8"));
  const binary = "0x" + fs.readFileSync("./contracts_Note_sol_Note.bin", "utf8").trim();
  
  // ===== ContractFactory =====
  const contractFactory = new ethers.ContractFactory(abi, binary, account);
  
  console.log("Deploying...");
  
  // ===== Деплой =====
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  
  // ===== Адрес контракта =====
  const address = await contract.getAddress();
  console.log("Contract deployed at:", address);
  
  // ===== Взаимодействие =====
  let curNote = await contract.getNote();
  console.log("First request of note:", curNote);
  
  console.log("Waiting for transaction...");
  const txResponse = await contract.setNote("My first note");
  const txReceipt = await txResponse.wait();
  
  curNote = await contract.getNote();
  console.log("New note:", curNote);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });