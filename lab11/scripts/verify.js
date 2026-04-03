const hre = require("hardhat");

async function main() {
  // Адрес вашего контракта (ЗАМЕНИТЕ НА СВОЙ!)
const contractAddress = "0x2d66a5b85E4Cc2565513dE03a9960AB029616c0C";
  
  console.log("🔍 Проверка NFT коллекции...\n");
  console.log(`📄 Контракт: ${contractAddress}\n`);
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  const totalSupply = await myNFT.getTotalSupply();
  
  console.log("===========================================");
  console.log(`📊 Всего NFT в коллекции: ${totalSupply}`);
  console.log("===========================================\n");
  
  if (totalSupply === 0n) {
    console.log("⚠️ Коллекция пуста! Заминтите NFT сначала.");
    return;
  }
  
  const [owner] = await hre.ethers.getSigners();
  
  for (let i = 1; i <= totalSupply; i++) {
    try {
      const ownerOf = await myNFT.ownerOf(i);
      const uri = await myNFT.tokenURI(i);
      
      console.log(`🎨 Token #${i}:`);
      console.log(`   👤 Владелец: ${ownerOf}`);
      console.log(`   🔗 URI: ${uri}`);
      
      // Проверяем, является ли владелец адресом кошелька
      if (ownerOf.toLowerCase() === owner.address.toLowerCase()) {
        console.log(`   ✅ Это ваш NFT`);
      }
      
      console.log();
      
    } catch (error) {
      console.log(`❌ Ошибка при получении информации о Token #${i}`);
      console.log();
    }
  }
  
  // Дополнительная информация
  console.log("===========================================");
  console.log("📋 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:");
  console.log("===========================================");
  console.log(`👤 Ваш адрес: ${owner.address}`);
  console.log(`🏷️  Название коллекции: ${await myNFT.name()}`);
  console.log(`🔤 Символ: ${await myNFT.symbol()}`);
  console.log(`📊 Общий supply: ${totalSupply}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Ошибка:", error);
    process.exit(1);
  });