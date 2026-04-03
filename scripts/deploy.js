const hre = require("hardhat");

async function main() {
  console.log("🚀 Деплой MyNFT контракта...");
  
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  
  // Ждем пока контракт задеплоится
  await myNFT.waitForDeployment();
  
  // Получаем адрес
  const address = await myNFT.getAddress();
  
  console.log("✅ Контракт развернут!");
  console.log(`📄 Адрес: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });