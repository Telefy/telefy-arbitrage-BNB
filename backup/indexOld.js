const Big = require("big.js");
const blk = require("./blockchain");
const UniswapV2Pair = require("./abi/IUniswapV2Pair.json");
const abi = require("./abi/abi.json");
const aproveAbi = require("./abi/approve.json");

// define address of Pair contract
// const PAIR_ADDR = "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5";
const PAIR_ADDR = "0xe3771478eA75C60525919512fed05130F1032cEB";


// blk.web3http.eth.accounts.wallet.add('89ffe7016912c892dbd513c83099b4cde7f2e3fd2f07b469241ccd078dea90ab');
blk.web3http.eth.accounts.wallet.add('07e812e8d9440d6894b242fd446c0e2fa12c0bc14c5b34f3ac01a6b9fe7cecbe');


const INTERVAL = 1000;

// create web3 contract object
const PairContractHTTP = new blk.web3http.eth.Contract(
 abi.abi,
  PAIR_ADDR
);
const PairContractApprove = new blk.web3http.eth.Contract(
  aproveAbi.abi,
  // [
  //   "function approve(address spender, uint256 amount) external returns (bool)"
  // ],
  '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b'
);

// function to get reserves
const getReserves = async (ContractObj) => {
  // try {
  console.log("reseverrr")

  let exceptAmount = 0.435645*1000000000000000000;
  let inputAmount = 8000*1000000;
console.log(exceptAmount,"---",inputAmount)
 
const fundit = await  ContractObj.methods.executeSwap('0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b','0x1f9840a85d5af5bf1d1762f925bdaddc4201f984','USDC','UNI','UNISWAP','SUSHISWAP',BigInt(inputAmount),BigInt(exceptAmount),BigInt(50)).send({
  from: '0x84FA20d4dd2B79727bdCFcb2eA33cE8F0FC2D47a', 
  value: inputAmount,
  gas:6000000
 })
.then(res => 
console.log('Success', res))
.catch(err => console.log(err,"---errrorr")) 



};

const approve = async (ContractObj) => {
  
  let inputAmount = 8000*1000000;
  const approve = await  ContractObj.methods.approve('0xe3771478eA75C60525919512fed05130F1032cEB',inputAmount).send({
  from:"0x84FA20d4dd2B79727bdCFcb2eA33cE8F0FC2D47a", 
  gas:6000000}).then (res => {

    console.log(res.events)
    getReserves(PairContractHTTP);
  })
    .catch(err => console.log(err,"---errrorr")) 
    
}



approve(PairContractApprove);
// getReserves(PairContractHTTP);
