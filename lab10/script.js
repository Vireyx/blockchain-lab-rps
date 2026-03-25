import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const contractAddress = "0x5218C608D1A092a09777e97eBda8Ca237343DBCA";

const ABI = [
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isWinner",
                "type": "bool"
            }
        ],
        "name": "GamePlayed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_side",
                "type": "uint256"
            }
        ],
        "name": "playGame",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "randomNumber",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider;
let signer;
let contract;

function parseError(error) {
    return (
        error?.reason ||
        error?.data?.message ||
        error?.error?.message ||
        error?.message ||
        "Неизвестная ошибка"
    );
}

window.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");
    const resultEl = document.getElementById("result");
    const contractBalanceEl = document.getElementById("contractBalance");

    const connectBtn = document.getElementById("connectWallet");
    const balanceBtn = document.getElementById("checkBalance");
    const headsBtn = document.getElementById("playHeads");
    const tailsBtn = document.getElementById("playTails");
    const resultBtn = document.getElementById("getResult");

    function setStatus(text) {
        statusEl.textContent = text;
        console.log("[STATUS]", text);
    }

    function setResult(text) {
        resultEl.textContent = text;
        console.log("[RESULT]", text);
    }

    async function connectWallet() {
        try {
            if (typeof window.ethereum === "undefined") {
                setStatus("MetaMask не установлен.");
                return;
            }

            setStatus("Подключение к MetaMask...");

            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, ABI, signer);

            const userAddress = await signer.getAddress();

            setStatus("Кошелек подключен");
            setResult("Адрес: " + userAddress);
        } catch (error) {
            setStatus("Ошибка подключения");
            setResult(parseError(error));
        }
    }

    async function checkContractBalance() {
        try {
            if (!contract) {
                setResult("Сначала подключите MetaMask.");
                return;
            }

            const balanceWei = await contract.getBalance();
            const balanceBNB = ethers.utils.formatEther(balanceWei);

            contractBalanceEl.textContent = balanceBNB + " BNB";
            setResult("Баланс контракта обновлён.");
        } catch (error) {
            setResult("Ошибка баланса: " + parseError(error));
        }
    }

    async function play(side) {
        try {
            if (!contract) {
                setResult("Сначала подключите MetaMask.");
                return;
            }

            setStatus("Подготовка транзакции...");
            setResult("Открываем MetaMask...");

            const amountInWei = ethers.utils.parseEther("0.000001");

            const tx = await contract.playGame(side, {
                value: amountInWei
            });

            setStatus("Транзакция отправлена");
            setResult("Ждём подтверждения...");

            await tx.wait();

            setStatus("Транзакция подтверждена");
            setResult("Игра завершена. Нажмите Get Result.");
        } catch (error) {
            setStatus("Ошибка транзакции");
            setResult("Ошибка игры: " + parseError(error));
        }
    }

    async function getGamePlayed() {
        try {
            if (!contract || !provider) {
                setResult("Сначала подключите MetaMask.");
                return;
            }

            setStatus("Чтение результата...");
            setResult("Ищем событие GamePlayed...");

            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(currentBlock - 5000, 0);

            const events = await contract.queryFilter(
                contract.filters.GamePlayed(),
                fromBlock,
                currentBlock
            );

            if (events.length === 0) {
                setResult("События не найдены.");
                return;
            }

            const lastEvent = events[events.length - 1];
            const player = lastEvent.args.player;
            const isWinner = lastEvent.args.isWinner;

            setStatus("Результат получен");
            setResult(
                isWinner
                    ? `🎉 Победа! Игрок ${player} выиграл.`
                    : `💫 Проигрыш. Игрок ${player} не угадал сторону.`
            );
        } catch (error) {
            setStatus("Ошибка чтения события");
            setResult("Ошибка результата: " + parseError(error));
        }
    }

    connectBtn.addEventListener("click", connectWallet);
    balanceBtn.addEventListener("click", checkContractBalance);
    headsBtn.addEventListener("click", () => play(0));
    tailsBtn.addEventListener("click", () => play(1));
    resultBtn.addEventListener("click", getGamePlayed);

    setStatus("Приложение загружено.");
    setResult("Нажмите «Подключить MetaMask».");
});