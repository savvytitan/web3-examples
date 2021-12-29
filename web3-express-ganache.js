import express from "express";
import ganache from "ganache-cli";
import Web3 from "web3";
import bip39 from "bip39";
import { expect } from "chai";
import HDWalletProvider from "@truffle/hdwallet-provider";

//create a mnemonic
const mnemonic = bip39.generateMnemonic();
expect(bip39.validateMnemonic(mnemonic)).to.equal(true);

//note, that you can't invent arbitrary mnemonics:
expect(bip39.validateMnemonic("123")).to.equal(false);

// start a ganache instance and create 3 accounts when started
const provider = ganache.provider({
  mnemonic,
  total_accounts: 3,
  default_balance_ether: 100,
});

// reuse mnemonic and provider for another provider
const anotherProvider = new HDWalletProvider({
  mnemonic,
  providerOrUrl: provider,
  numberOfAddresses: 4,
});

// https://web3js.readthedocs.io/
const web3 = new Web3(provider);

const app = express();

// display information on node & accounts
app.get("/", async (req, res) => {
  const nodeInfo = await web3.eth.getNodeInfo();
  const blockNumber = await web3.eth.getBlockNumber();

  const accounts = await web3.eth.getAccounts();
  const hdwalletAccounts = await anotherProvider.getAddresses();
  const balanceOfFirstAccount = await web3.eth.getBalance(accounts[0]);
  const balanceOfSecondAccount = await web3.eth.getBalance(accounts[1]);

  return res.json({
    nodeInfo,
    blockNumber,
    mnemonic,
    web3Accounts: accounts,
    balances: {
      [accounts[0]]: balanceOfFirstAccount,
      [accounts[1]]: balanceOfSecondAccount,
    },
    hdWalletAccounts: hdwalletAccounts,
  });
});

// send money from accounts[0] to accounts[1]
// this should be a POST, but it's simple to show this way.
app.get("/transact", async (req, res) => {
  const accounts = await web3.eth.getAccounts();
  const receipt = await web3.eth.sendTransaction({
    from: accounts[0],
    to: accounts[1],
    value: 10 * 1e5,
  });
  res.json(receipt);
});

app.listen(8080, () => console.log("app started"));
