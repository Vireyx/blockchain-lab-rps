require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 31337
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: ["d51cb51602f4ddd3a14dfea872e97d460685c656e32894613ca6027e359c0432"] // Без "0x" в начале!
    }
  }
};