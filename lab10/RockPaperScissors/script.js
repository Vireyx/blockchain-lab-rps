import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// Адрес задеплоенного смарт-контракта RockPaperScissors
const contractAddress = "0x9f907EF2840d48D7F2eC5E28D9c973814569c899";

// ABI контракта RockPaperScissors
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
                "internalType": "uint8",
                "name": "playerChoice",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "computerChoice",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "result",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reward",
                "type": "uint256"
            }
        ],
        "name": "GamePlayed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "_choice",
                "type": "uint8"
            }
        ],
        "name": "playGame",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
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
        "name": "minBet",
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
    }
];

let provider;
let signer;
let contract;

const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const roundTextEl = document.getElementById("roundText");
const resultTextEl = document.getElementById("resultText");
const statusTextEl = document.getElementById("statusText");
const contractBalanceTextEl = document.getElementById("contractBalanceText");
const playerChoiceDisplay = document.getElementById("playerChoiceDisplay");
const computerChoiceDisplay = document.getElementById("computerChoiceDisplay");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");

const connectWalletBtn = document.getElementById("connectWallet");
const checkBalanceBtn = document.getElementById("checkBalance");
const resetBtn = document.getElementById("resetBtn");
const choiceButtons = document.querySelectorAll(".choice-btn");

const choiceData = {
    0: { name: "Камень", icon: "✊" },
    1: { name: "Ножницы", icon: "✌" },
    2: { name: "Бумага", icon: "✋" }
};

let playerScore = 0;
let computerScore = 0;
let roundNumber = 0;

function parseError(error) {
    return (
        error?.reason ||
        error?.data?.message ||
        error?.error?.message ||
        error?.message ||
        "Неизвестная ошибка"
    );
}

function setStatus(text) {
    statusTextEl.textContent = "Статус: " + text;
    console.log("[STATUS]", text);
}

function setResult(text) {
    resultTextEl.textContent = text;
    console.log("[RESULT]", text);
}

function addHistory(player, computer, result) {
    const empty = document.querySelector(".empty-history");
    if (empty) empty.remove();

    roundNumber++;

    const resultTextMap = {
        win: "Победа",
        lose: "Поражение",
        draw: "Ничья"
    };

    const item = document.createElement("li");
    item.classList.add(result);

    item.innerHTML = `
        <strong>Раунд ${roundNumber}</strong><br>
        Вы: ${choiceData[player].name} ${choiceData[player].icon} |
        Компьютер: ${choiceData[computer].name} ${choiceData[computer].icon}<br>
        Итог: ${resultTextMap[result]}
    `;

    historyList.prepend(item);
    historyCount.textContent = `${roundNumber} ходов`;
}

function getBattlePhrase(player, computer, result) {
    if (result === "draw") {
        return "Ничья. В этот раз арена не выбрала победителя.";
    }

    if (result === "win") {
        if (player === 0 && computer === 1) return "Камень ломает ножницы. Ты победил.";
        if (player === 1 && computer === 2) return "Ножницы режут бумагу. Ты победил.";
        if (player === 2 && computer === 0) return "Бумага накрывает камень. Ты победил.";
    }

    if (result === "lose") {
        if (computer === 0 && player === 1) return "Камень ломает ножницы. Компьютер победил.";
        if (computer === 1 && player === 2) return "Ножницы режут бумагу. Компьютер победил.";
        if (computer === 2 && player === 0) return "Бумага накрывает камень. Компьютер победил.";
    }

    return "Раунд завершён.";
}

async function connectWallet() {
    try {
        if (typeof window.ethereum === "undefined") {
            setStatus("MetaMask не установлен");
            setResult("Установите MetaMask и попробуйте снова");
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, ABI, signer);

        const address = await signer.getAddress();

        setStatus("кошелёк подключен");
        setResult("Адрес: " + address);
    } catch (error) {
        setStatus("ошибка подключения");
        setResult(parseError(error));
    }
}

async function checkBalance() {
    try {
        if (!contract) {
            setResult("Сначала подключите MetaMask");
            return;
        }

        const balanceWei = await contract.getBalance();
        const balanceBNB = ethers.utils.formatEther(balanceWei);

        contractBalanceTextEl.textContent = "Баланс контракта: " + balanceBNB + " BNB";
        setResult("Баланс контракта успешно получен");
    } catch (error) {
        setResult("Ошибка баланса: " + parseError(error));
    }
}

async function playGame(playerChoice) {
    try {
        if (!contract) {
            setResult("Сначала подключите MetaMask");
            return;
        }

        setStatus("отправка транзакции");
        setResult("Подтвердите ход в MetaMask");

        const betAmount = ethers.utils.parseEther("0.000001");

        const tx = await contract.playGame(playerChoice, {
            value: betAmount
        });

        setStatus("транзакция отправлена");
        setResult("Ждём подтверждения...");

        await tx.wait();

        const currentBlock = await provider.getBlockNumber();
        const events = await contract.queryFilter(
            contract.filters.GamePlayed(),
            Math.max(currentBlock - 100, 0),
            currentBlock
        );

        if (events.length === 0) {
            setStatus("событие не найдено");
            setResult("Игра сыграна, но событие GamePlayed не найдено");
            return;
        }

        const lastEvent = events[events.length - 1];

        const pChoice = Number(lastEvent.args.playerChoice);
        const cChoice = Number(lastEvent.args.computerChoice);
        const result = lastEvent.args.result;

        playerChoiceDisplay.textContent = choiceData[pChoice].icon;
        computerChoiceDisplay.textContent = choiceData[cChoice].icon;

        if (result === "win") {
            playerScore++;
        } else if (result === "lose") {
            computerScore++;
        }

        playerScoreEl.textContent = playerScore;
        computerScoreEl.textContent = computerScore;

        roundTextEl.textContent = `Раунд ${roundNumber + 1}`;
        setStatus("транзакция подтверждена");
        setResult(getBattlePhrase(pChoice, cChoice, result));

        addHistory(pChoice, cChoice, result);
    } catch (error) {
        setStatus("ошибка транзакции");
        setResult("Ошибка игры: " + parseError(error));
    }
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    roundNumber = 0;

    playerScoreEl.textContent = "0";
    computerScoreEl.textContent = "0";

    playerChoiceDisplay.textContent = "?";
    computerChoiceDisplay.textContent = "?";

    roundTextEl.textContent = "Подключите кошелёк и выберите жест";
    resultTextEl.textContent = "Арена ждёт";
    statusTextEl.textContent = "Статус: не подключено";
    contractBalanceTextEl.textContent = "Баланс контракта: не проверен";

    historyList.innerHTML = `<li class="empty-history">История пока пуста</li>`;
    historyCount.textContent = "0 ходов";
}

connectWalletBtn.addEventListener("click", connectWallet);
checkBalanceBtn.addEventListener("click", checkBalance);
resetBtn.addEventListener("click", resetGame);

choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
        const choice = Number(button.dataset.choice);
        playGame(choice);
    });
});