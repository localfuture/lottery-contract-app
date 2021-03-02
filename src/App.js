import React, { useState, useEffect } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

function App() {
  const [manager, setmanager] = useState('');
  const [players, setplayers] = useState([]);
  const [balance, setBalance] = useState('');
  const [fund, setFund] = useState(0);
  const [message, setmessage] = useState('');
  const [lastwinner, setlastwinner] = useState('');

  useEffect(() => {
    async function fetchManager() {
      const managerAddress = await lottery.methods.manager().call();
      setmanager(managerAddress);
    }

    async function fetchLastWinner() {
      const lastWinnerAddress = await lottery.methods.lastWinner().call();
      setlastwinner(lastWinnerAddress);
    }

    async function fetchPlayers() {
      const playerAddress = await lottery.methods.getPlayers().call();
      setplayers(playerAddress);
    }

    async function fetchBalance() {
      const contractBalance = await web3.eth.getBalance(lottery.options.address);
      setBalance(contractBalance);
    }

    fetchManager();
    fetchPlayers();
    fetchBalance();
    fetchLastWinner();
  }, []);

  async function connectToMetMask() {
    window.ethereum.enable().then(result => {
      console.log(result);;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();

    web3.eth.getAccounts().then(function (accounts) {
      console.log("accounts", accounts[0]);
      setmessage('Waiting on transaction success...');
      lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(fund, 'ether')
      })
        .then(function (result, error) {
          if (!error) {
            setmessage('You have been entered! ');
            console.log(result);
          } else {
            console.log(error);
          }
        });
    });
  }

  async function pickWinner() {
    const [account] = await web3.eth.getAccounts();

    setmessage('Picking winner! Please wait...');
    await lottery.methods.pickWinner().send({
      from: account
    }).then(function (result, error) {
      if (!error) {
        setmessage('Winner has been picked! ');
        console.log(result);
      } else {
        console.log(error);
      }
    });

  }

  return (
    <>
      <h1>Lottery Contract</h1>
      <button onClick={connectToMetMask}>Connect to MetaMask</button>
      <p>
        This contract is managed by {manager}.
      </p>
      <p>
        There are currently {players.length} people entered,
        competing to win {web3.utils.fromWei(balance, 'ether')} ether!
      </p>
      <hr />
      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <div>
            <input name="fund" onChange={e => setFund(e.target.value)} value={fund} />
          </div>
        </div>
        <button>Enter</button>
      </form>
      <hr/>
        <h4>Ready to pick a winner? </h4>
        <button onClick={pickWinner}>Pick Winner</button>
      <hr />
        <h4>Last Winner was {lastwinner}</h4>
      <hr />
        <h1>{message}</h1>

    </>
  );
}

export default App;
