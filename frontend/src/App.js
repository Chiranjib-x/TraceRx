import { useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

const contractAddress = "0x3b06CFE0A3DB17E22A7E242858982F2991039Db3";

const abi = [
  "function createBatch(string,string,string)",
  "function transferBatch(string,address)",
  "function getBatch(string) view returns (string,string,string,address)"
];

function App() {

  const [account, setAccount] = useState("");
  const [batchId, setBatchId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [transferAddress, setTransferAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [batchData, setBatchData] = useState(null);

  //  Force Polygon Amoy
  async function switchToAmoy() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }]
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x13882",
            chainName: "Polygon Amoy",
            rpcUrls: ["https://rpc-amoy.polygon.technology"],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18
            },
            blockExplorerUrls: ["https://amoy.polygonscan.com/"]
          }]
        });
      }
    }
  }

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");

    await switchToAmoy();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  async function getContract() {
    await switchToAmoy();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  }

  async function createBatchHandler() {
    try {
      const contract = await getContract();
      const tx = await contract.createBatch(
        batchId,
        medicineName,
        manufacturer
      );
      await tx.wait();
      alert("Batch Created Successfully!");
    } catch (error) {
      alert("Batch may already exist.");
    }
  }

  async function transferBatchHandler() {
    try {
      const contract = await getContract();
      const tx = await contract.transferBatch(batchId, transferAddress);
      await tx.wait();
      alert("Batch Transferred!");
    } catch (error) {
      alert("Transfer failed.");
    }
  }

  async function getBatchHandler() {
    try {
      setLoading(true);
      setStatus("");

      const contract = await getContract();
      const data = await contract.getBatch(batchId);

      setBatchData({
        id: data[0],
        name: data[1],
        manufacturer: data[2],
        owner: data[3]
      });

      setStatus("verified");

    } catch (error) {
      setBatchData(null);
      setStatus("notfound");
    }

    setLoading(false);
  }

  return (
    <div className="app-container">

      <header className="app-header">
        <div>
          <h1> Medicine Trace System</h1>
          <p className="subtitle">Blockchain-based Pharmaceutical Tracking</p>
        </div>

        <button className="wallet-btn" onClick={connectWallet}>
          {account
            ? `🟢 ${account.slice(0,6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </header>

      <div className="dashboard">

        {/* Create */}
        <div className="card">
          <h2>Create New Batch</h2>
          <input
            placeholder="Batch ID"
            onChange={e => setBatchId(e.target.value)}
          />
          <input
            placeholder="Medicine Name"
            onChange={e => setMedicineName(e.target.value)}
          />
          <input
            placeholder="Manufacturer"
            onChange={e => setManufacturer(e.target.value)}
          />
          <button className="primary-btn" onClick={createBatchHandler}>
            Create Batch
          </button>
        </div>

        {/* Transfer */}
        <div className="card">
          <h2>Transfer Ownership</h2>
          <input
            placeholder="Batch ID"
            onChange={e => setBatchId(e.target.value)}
          />
          <input
            placeholder="New Owner Address"
            onChange={e => setTransferAddress(e.target.value)}
          />
          <button className="primary-btn" onClick={transferBatchHandler}>
            Transfer
          </button>
        </div>

        {/* Verify */}
        <div className="card verify-card">
          <h2> Verify Batch</h2>

          <input
            placeholder="Enter Batch ID"
            onChange={e => setBatchId(e.target.value)}
          />

          <button className="primary-btn" onClick={getBatchHandler}>
            Check Authenticity
          </button>

          {loading && <div className="loader"></div>}

          {status === "verified" && batchData && (
            <div className="batch-info">
              <div className="status-badge verified">✔ Authentic</div>

              <div className="info-row">
                <span>Batch ID:</span>
                <strong>{batchData.id}</strong>
              </div>

              <div className="info-row">
                <span>Medicine:</span>
                <strong>{batchData.name}</strong>
              </div>

              <div className="info-row">
                <span>Manufacturer:</span>
                <strong>{batchData.manufacturer}</strong>
              </div>

              <div className="info-row">
                <span>Owner:</span>
                <strong>{batchData.owner}</strong>
              </div>

              <QRCodeCanvas value={batchData.id} size={150} />
            </div>
          )}

          {status === "notfound" && (
            <div className="status-badge error"> Batch Not Found</div>
          )}
        </div>

      </div>

      <footer className="footer">
  <p>
    Made with <span className="heart">❤️</span> by{" "}
    <a 
      href="https://github.com/Chiranjib-x" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="github-link"
    >
      <svg 
        height="20" 
        viewBox="0 0 16 16" 
        fill="currentColor" 
        style={{ verticalAlign: "middle", marginRight: "8px" }}
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
      </svg>
      Chiranjib-x
    </a>
  </p>
</footer>
    </div>
  );
}

export default App;
