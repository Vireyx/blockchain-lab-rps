const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2d66a5b85E4Cc2565513dE03a9960AB029616c0C";
  
  console.log("🎨 Минт NFT...");
  console.log(`📄 Контракт: ${contractAddress}`);
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  const [owner] = await hre.ethers.getSigners();
  console.log(`👤 Адрес: ${owner.address}`);
  
  // Временный URI (позже замените на IPFS из Pinata)
  const tokenURI = "ipfs://QmTest123";
  
  const tx = await myNFT.mintNFT(owner.address, tokenURI);
  await tx.wait();
  
  const tokenId = await myNFT.getTotalSupply();
  console.log(`✅ NFT заминчено! Token ID: ${tokenId}`);
  console.log(`🔗 URI: ${tokenURI}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });