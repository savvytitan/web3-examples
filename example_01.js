import MasksABI from "@/files/ERC721.abi";
import NCTABI from "@/files/ERC20.abi";
import {
  CONTRACT_ADDRESS,
  NCT_CONTRACT_ADDRESS,
  INFURA_API,
  STARTING_INDEX,
} from "@/assets/constants";
import Web3 from "web3";
import router from "../router";

const web3 = new Web3(INFURA_API);
const contract = new web3.eth.Contract(MasksABI, CONTRACT_ADDRESS);
const nctContract = new web3.eth.Contract(NCTABI, NCT_CONTRACT_ADDRESS);

const ethEnabled = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    const defaultAccount = (await window.web3.eth.getAccounts())[0];
    return defaultAccount;
  }
  return false;
};

const getMasksContract = async () => {
  const defaultAccount = await ethEnabled();
  if (defaultAccount === false) {
    return false;
  }

  return new window.web3.eth.Contract(MasksABI, CONTRACT_ADDRESS, {
    from: defaultAccount,
  });
};

const getNCTContract = async () => {
  const defaultAccount = await ethEnabled();
  if (defaultAccount === false) {
    return false;
  }
  return new window.web3.eth.Contract(NCTABI, NCT_CONTRACT_ADDRESS, {
    from: defaultAccount,
  });
};

const maxUserCanBuy = async () => {
  const defaultAccount = await ethEnabled();
  if (defaultAccount === false) {
    router.push({
      path: "/no-wallet",
      query: { redirect: "/" },
    });
  }

  const currentlyOwned = await contract.methods
    .balanceOf(defaultAccount)
    .call();
  return Math.max(0, 20 - currentlyOwned);
};

const balanceOf = async (address) => {
  const defaultAccount = await ethEnabled();
  const currentlyOwned = await contract.methods
    .balanceOf(address || defaultAccount)
    .call();
  return currentlyOwned;
};

const nctBalanceOf = async (address) => {
  const defaultAccount = await ethEnabled();
  const currentlyOwned = await nctContract.methods
    .balanceOf(address || defaultAccount)
    .call();
  return currentlyOwned;
};

const tokenOfOwnerByIndex = async (index, address) => {
  const defaultAccount = await ethEnabled();
  const currentlyOwned = await contract.methods
    .tokenOfOwnerByIndex(address || defaultAccount, index)
    .call();
  return currentlyOwned;
};

const accumulatedForIndex = async (index) => {
  const defaultAccount = await ethEnabled();

  if (!defaultAccount) {
    return nctContract.methods.accumulated(index).call();
  }

  const contract = new window.web3.eth.Contract(NCTABI, NCT_CONTRACT_ADDRESS, {
    from: defaultAccount,
  });

  return contract.methods.accumulated(index).call();
};

const claimNCT = async (indices) => {
  const defaultAccount = await ethEnabled();

  const contract = new window.web3.eth.Contract(NCTABI, NCT_CONTRACT_ADDRESS, {
    from: defaultAccount,
  });

  return contract.methods.claim(indices).send({ from: defaultAccount });
};

const changeNFTName = async (index, newName) => {
  const masksContract = await getMasksContract();
  return masksContract.methods.changeName(index, newName).send();
};

const getNFTName = async (index) => {
  return contract.methods.tokenNameByIndex(index).call();
};

const isNameReserved = async (name) => {
  return contract.methods.isNameReserved(name).call();
};

const getNFTOwner = async (index) => {
  return contract.methods.ownerOf(index).call();
};

const toEthUnit = (wei) => {
  return web3.utils.fromWei(wei);
};

const getTransactionReceipt = async (windowWeb3, hash) => {
  return windowWeb3.eth.getTransactionReceipt(hash);
};

const getTimestampFromBlock = async (hash) => {
  const receipt = await web3.eth.getBlock(hash);
  return receipt.timestamp;
};

const getRevealedMaskIndex = function (nftIndex) {
  return (Number(nftIndex) + STARTING_INDEX) % 16384;
};

const isValidETHAddress = (address) => {
  return web3.utils.isAddress(address);
};

const generateSignature = async (dataToSign) => {
  const defaultAccount = await ethEnabled();
  if (defaultAccount === false) {
    return false;
  }
  return await window.web3.eth.personal.sign(dataToSign, defaultAccount);
};

export {
  web3,
  contract,
  ethEnabled,
  getNCTContract,
  getMasksContract,
  maxUserCanBuy,
  balanceOf,
  tokenOfOwnerByIndex,
  accumulatedForIndex,
  toEthUnit,
  claimNCT,
  changeNFTName,
  getNFTName,
  isNameReserved,
  getNFTOwner,
  nctBalanceOf,
  getTransactionReceipt,
  getTimestampFromBlock,
  getRevealedMaskIndex,
  isValidETHAddress,
  generateSignature,
};
