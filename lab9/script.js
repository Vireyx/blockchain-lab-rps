console.log("Script loaded!");
import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.esm.min.js';

// Адрес вашего развернутого контракта (замените на свой)
const contractAddress = "0xC7B7b5fb41b86EdE3394810932923bB05D1388e9";

// ABI вашего контракта (замените на свой из Remix)
const ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_note",
				"type": "string"
			}
		],
		"name": "setNote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getNote",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

let provider;
let signer;
let contract;

// Инициализация при загрузке страницы
async function init() {
    try {
        // Проверяем, установлен ли MetaMask
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, ABI, signer);
            console.log("Контракт подключен:", contractAddress);
        } else {
            alert("Пожалуйста, установите MetaMask!");
        }
    } catch (error) {
        console.error("Ошибка подключения:", error);
        alert("Ошибка подключения к MetaMask");
    }
}

// Функция записи заметки
async function setText() {
    try {
        const input = document.getElementById('inputNote');
        const result = document.getElementById('result');
        const noteText = input.value;
        
        if (!noteText.trim()) {
            alert("Введите текст заметки!");
            return;
        }
        
        result.textContent = "Отправка транзакции...";
        
        // Вызываем функцию контракта
        const tx = await contract.setNote(noteText);
        console.log("Транзакция отправлена:", tx.hash);
        
        // Ждем подтверждения
        await tx.wait();
        console.log("Транзакция подтверждена!");
        
        result.textContent = "Заметка сохранена!";
        input.value = '';
        
    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById('result').textContent = "Ошибка: " + error.message;
    }
}

// Функция чтения заметки
async function getNote() {
    try {
        const result = document.getElementById('result');
        result.textContent = "Чтение...";
        
        // Вызываем view функцию контракта
        const note = await contract.getNote();
        console.log("Получена заметка:", note);
        
        result.textContent = note || "Пусто";
        
    } catch (error) {
        console.error("Ошибка:", error);
        result.textContent = "Ошибка: " + error.message;
    }
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', async () => {
    await init();
    
    const setTextBtn = document.getElementById('setText');
    const getNoteBtn = document.getElementById('getNote');
    
    setTextBtn.addEventListener('click', setText);
    getNoteBtn.addEventListener('click', getNote);
});