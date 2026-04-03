const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Адрес вашего контракта (ЗАМЕНИТЕ НА СВОЙ!)
const contractAddress = "0x2d66a5b85E4Cc2565513dE03a9960AB029616c0C";
  
  console.log("🎨 Минт NFT коллекции...\n");
  console.log(`📄 Контракт: ${contractAddress}\n`);
  
  // Загружаем Token URIs из файла
  const nftsPath = path.join(__dirname, "uploaded-nfts.json");
  
  if (!fs.existsSync(nftsPath)) {
    console.log("❌ Файл uploaded-nfts.json не найден!");
    console.log("Сначала выполните: node scripts/uploadToPinata.js");
    return;
  }
  
  const nfts = JSON.parse(fs.readFileSync(nftsPath, "utf8"));
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  const [owner] = await hre.ethers.getSigners();
  console.log(`👤 Адрес кошелька: ${owner.address}\n`);
  
  let successCount = 0;
  
  for (const nft of nfts) {
    try {
      console.log(`📤 Минт NFT #${nft.id}: ${nft.name}...`);
      
      const tx = await myNFT.mintNFT(owner.address, nft.tokenURI);
      await tx.wait();
      
      const tokenId = await myNFT.getTotalSupply();
      console.log(`✅ Заминчено! Token ID: ${tokenId}`);
      console.log(`🔗 URI: ${nft.tokenURI}`);
      console.log(`⛽ Транзакция успешна!\n`);
      
      successCount++;
      
    } catch (error) {
      console.error(`❌ Ошибка при минте NFT #${nft.id}:`, error.message);
      console.log();
    }
  }
  
  const totalSupply = await myNFT.getTotalSupply();
  
  console.log("===========================================");
  console.log("🎉 МИНТ ЗАВЕРШЕН!");
  console.log("===========================================");
  console.log(`✅ Успешно заминчено: ${successCount} из ${nfts.length}`);
  console.log(`📊 Всего NFT в контракте: ${totalSupply}`);
  console.log(`📄 Адрес контракта: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });