const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2d66a5b85E4Cc2565513dE03a9960AB029616c0C";
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  console.log("\n🔍 Проверка Token #6:\n");
  
  try {
    const owner = await myNFT.ownerOf(6);
    const uri = await myNFT.tokenURI(6);
    
    console.log("✅ Token #6 существует!");
    console.log(`👤 Владелец: ${owner}`);
    console.log(`🔗 URI: ${uri}`);
    
  } catch (error) {
    console.log("❌ Token #6 НЕ существует!");
    console.log(`Ошибка: ${error.message}`);
  }
  
  const totalSupply = await myNFT.totalSupply();
  console.log(`\n📊 Всего токенов: ${totalSupply}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });