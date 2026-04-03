const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2d66a5b85E4Cc2565513dE03a9960AB029616c0C";
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  const [owner] = await hre.ethers.getSigners();
  
  console.log("\n🎨 Минт Token #6...\n");
  
  // URI для токена #6 (Процессы в ОС)
  const tokenURI = "ipfs://QmconPuBr63mPrRpyPLuC3R99dhxFmfW57BrPNxC729PMC";
  
  const tx = await myNFT.mintNFT(owner.address, tokenURI);
  await tx.wait();
  
  console.log("✅ Token #6 заминчен!");
  console.log(`🔗 Транзакция: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });