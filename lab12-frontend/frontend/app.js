import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

const CONTRACT = "0xF51Cf57dB2D874dd55B67Fd1FB14Bd95EdFEf361";

const ABI = [
  "function createDocument(string _hash, address[] _signers)",
  "function signDocument(uint256 id)",
  "function isAllowed(uint256 id, address user) view returns (bool)",
  "function isSigned(uint256 id, address user) view returns (bool)",
  "function isCompleted(uint256 id) view returns (bool)"
];

let provider, signer, contract;

async function getHash(file) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function connect() {
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT, ABI, signer);

  statusDisplay.innerText = "Wallet connected ✅";
}

async function createDoc() {
  const fileInput = document.getElementById("fileInput");

  if (!fileInput || !fileInput.files.length) {
    statusDisplay.innerText = "Select file ❌";
    return;
  }

  const file = fileInput.files[0];

  const rawValue = document.getElementById("signers").value.trim();
  const signers = rawValue.split(",").map(s => s.trim()).filter(Boolean);

  if (signers.length === 0) {
    statusDisplay.innerText = "Enter signers ❌";
    return;
  }

  const hash = await getHash(file);

  const tx = await contract.createDocument(hash, signers);
  await tx.wait();

  statusDisplay.innerText = "Created ✅";
}

async function signDoc() {
  const docIdInput = document.getElementById("docId");

  try {
    const id = docIdInput.value;

    if (!id) {
      statusDisplay.innerText = "Enter Document ID ❌";
      return;
    }

    statusDisplay.innerText = "Checking permissions...";
    const addr = await signer.getAddress();

    const ok = await contract.isAllowed(id, addr);

    if (!ok) {
      statusDisplay.innerText = "Not allowed ❌";
      return;
    }

    statusDisplay.innerText = "Signing... please confirm in wallet";
    const tx = await contract.signDocument(id);

    statusDisplay.innerText = "Waiting for block confirmation...";
    await tx.wait();

    statusDisplay.innerText = "Signed successfully! ✅";
  } catch (error) {
    console.error(error);
    statusDisplay.innerText = "Error: " + (error.reason || error.message);
  }
}

const statusDisplay = document.getElementById("status");
document.getElementById("connect").onclick = connect;
document.getElementById("create").onclick = createDoc;
document.getElementById("sign").onclick = signDoc;