import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {

  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([{
    address: "0xa82Df135165f5A56fb75281025A18C7B7E459aD7",
    timestamp: "Mon Sep 26 2022 09:40:36 GMT+0200 (hora de verano de Europa central)",
    message: "https://www.youtube.com/embed/M576WGiDBdQ"
  }]);
  const [msg, setMsg] = useState("");

  const contractAddress="0x5bA3a94b398F812D5965be14C4130503f141BB69"
  //"0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts"   });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = event => {
    setMsg(event.target.value);

    console.log('value is:', msg);
  };

  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        
        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 });
        setLoading(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

       /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        waves.forEach(wave => {
          setAllWaves(current => [...current, {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          }]);
        });

        /*
         * Store our data in React State
         */
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer gradient-bg-welcome">
      <div className="dataContainer">
        <div className="header text-white">
        👋 Hey there! 
        </div>

        <div className="bio">
          I am learning Solidity and would like if you share with me Youtube tutorials about it.
        </div>
        <div style={{width: "50%", display: "flex", justifyContent: "center"}}>
          <input
            className="blue-glassmorphism text-white"
            type="text"
            id="message"
            name="msg"
            onChange={handleChange}
            value={msg}
            autoComplete="off"
            placeholder="Send a link from an awesome tutorial"
          />
        </div>
                {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton text-white bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <button className="waveButton text-white bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]" onClick={wave}>
          Send youtube embed link
        </button>
        {loading && (
          <div className="spinner-container">
            <div className="loading-spinner">
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10 gap-1.5">
          {allWaves.reverse().map((wave, index) => {
            return (
              <div key={index} className="bg-[#181918] rounded-md hover:shadow-2xl text-white">
                <div style={{margin: "5px"}}><b>Address: </b>{wave.address}</div>
                <div style={{margin: "5px"}}><b>Time: </b>{wave.timestamp.toString()}</div>
                <iframe width="100%" height="315" src={wave.message} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
              )
          })}
        </div>
      </div>
    </div>
  );
}

export default App