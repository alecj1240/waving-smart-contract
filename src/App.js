import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {
  const [currAccount, setCurrAccount] = React.useState("");
    const contractAddress = "0xbf0FAe2cbCb03E2c52146962Ca43D142b60410Fb";
  const contractABI = abi.abi;

  const [allWaves, setAllWaves] = React.useState([]);
  const [message, setMessage] = React.useState([]);

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum){
      console.log("make sure you have metamask")
      return;
    } else {
      console.log(" We have an ethereum object", ethereum)
    }

      // basically we are trying to get the account info
    ethereum.request({ method: 'eth_accounts'})
      .then(accounts => {
        if (accounts.length !== 0){
          const account = accounts[0];
          console.log("Found an authorized account:", account)
          setCurrAccount(account);
          getAllWaves();

        } else {
          console.log("No authorised account found")
        }
      })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum){
      alert("Get Metamask wallet")
    }
    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("ethereum wallet connected: ", accounts[0])
      setCurrAccount(accounts[0])
    })
    .catch(err => console.log(err))
  }

  React.useEffect(() => {
      checkIfWalletIsConnected();
    }, [])

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);
    let waves = await wavePortalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave._address,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log(wavesCleaned);
    setAllWaves(wavesCleaned)
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves();
    console.log("Retrieved total wave count...", count.toNumber());

    const waveTxn = await waveportalContract.wave(message);
    
    console.log("Mining...", waveTxn.hash);
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash);
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Hey! I'm Alec! Connect your Ethereum wallet and send me a message on the blockchain!
        </div>

        <textarea 
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          style={{marginTop: "10px"}}
        />

        <button className="waveButton" onClick={wave}>
          Send a message
        </button>

        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          console.log(wave);
          return (
            <div style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
