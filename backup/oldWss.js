const UniswapV2Pair = require("../abi/IUniswapV2Pair.json");
const pancakeFactory = require("../abi/pancakeFactory.json");
require("dotenv").config({});
const Web3 = require("web3");
const random = require ('lodash/random');
const { param } = require("express/lib/request");
// const Provider = require('@truffle/hdwallet-provider'); 
// const provider = new Provider("89ffe7016912c892dbd513c83099b4cde7f2e3fd2f07b469241ccd078dea90ab", "https://mainnet.infura.io/v3/
const providerUrls = [
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed.binance.org/',
]
const randomIndex = random(0, providerUrls.length - 1)
console.log(providerUrls[randomIndex])
const httpProvider = new Web3.providers.HttpProvider(providerUrls[randomIndex], { timeout: 10000 })
const web3http = new Web3(httpProvider);

// const PAIR_ADDR = "0x58f876857a02d6762e0101bb5c46a8c1ed44dc16"; // pancake
const PAIR_ADDR = "0x51e6d27fa57373d8d4c256231241053a70cb1d93"; // Apeswap

const CONTRACT_ADDRESS = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const FROM_TOKEN = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"; // WBNB
const TO_TOKEN = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // BUSD

// create web3 pair object
const PairContractHTTP = new web3http.eth.Contract(
  UniswapV2Pair.abi,
  PAIR_ADDR
);
// create web3 contract object
const FactoryContractHTTP = new web3http.eth.Contract(
  pancakeFactory.abi,
  CONTRACT_ADDRESS
);

// function to get reserves
const getReserves = async (ContractObj,name) => {
  const _reserves = await ContractObj.methods[name]().call();
 console.log(_reserves.reserve0,"---reserves11")
 console.log(_reserves.reserve1,"---reserves22")
};

// function to get pair
const getPair = async (ContractObj,name,params) => {
  params = params.join();
  params = '"'+params.replace(/,/g,'","')+'"';
  let param = params;
  console.log(param)
  const _reserves = await ContractObj.methods[name](param).call();
 console.log(_reserves,"---reserves11")
};


getReserves(PairContractHTTP,'getReserves');
// getPair(FactoryContractHTTP,'getPair',[FROM_TOKEN,TO_TOKEN]);
