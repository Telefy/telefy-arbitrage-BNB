const blk = require("./blockchain");
const abi = require("./abi/abi.json");
const aproveAbi = require("./abi/approve.json");

// define address of Pair contract
// const PAIR_ADDR = "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5";
// const CONTRACT_ADDRESS = "0xc921b0176Bd8a0B270637589C6B53C245d1B1Ec1";
const CONTRACT_ADDRESS = "0x9871b1D22e7661ced0167002911a91126eD4ac14";

// Kovan
// const FROM_TOKEN = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"; // WETH
// const TO_TOKEN = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa"; // DAI

// Goerli
const FROM_TOKEN = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // WETH
const TO_TOKEN = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"; // DAI

const INPUT_AMT = 0.1 * 10 ** 18;
const OUTPUT_AMT = 200 * 10 ** 18;

// blk.web3http.eth.accounts.wallet.add('89ffe7016912c892dbd513c83099b4cde7f2e3fd2f07b469241ccd078dea90ab');
const web3Account = blk.web3http.eth.accounts.privateKeyToAccount(
  "0x"+ process.env.WALLET_PRIVATE_KEY
);
// const address = blk.web3http.eth.sign(web3Account.address);

const INTERVAL = 1000;

// const networkId = await  blk.web3http.eth.net.getId();



// create web3 contract object
const PairContractHTTP = new blk.web3http.eth.Contract(
  abi.abi,
  CONTRACT_ADDRESS
);
const PairContractApprove = new blk.web3http.eth.Contract(
  aproveAbi.abi,
  // [
  //   "function approve(address spender, uint256 amount) external returns (bool)"
  // ],
  FROM_TOKEN
);

// function to get reserves
const getReserves = async (ContractObj, inputAmount) => {
  // try {
  console.log("reserve");

  let exceptAmount = OUTPUT_AMT;
  console.log(exceptAmount, "---", inputAmount);

  const fundit = await ContractObj.methods
    .executeSwap(
      // Kovan
      // "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
      // "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",

      // Goerli
      FROM_TOKEN,
      TO_TOKEN,
      "WETH",
      "DAI",
      "UNISWAP",
      "SUSHISWAP",
      BigInt(inputAmount),
      BigInt(exceptAmount),
      BigInt(50)
    )
    .send({
      from: web3Account.address,
      gas: 6000000,
    })
    .then((res) => {
      console.log("Success", res)
      
    })
    .catch((err) => console.log(err, "---errrorr"));
};

const approve = async (ContractObj) => {
  let inputAmount = INPUT_AMT;
  await ContractObj.methods
    .approve(CONTRACT_ADDRESS, BigInt(inputAmount))
    .send({
      from: web3Account.address,
      gas: 6000000,
    })
    .then((res) => {
      console.log(res.events);
      getReserves(PairContractHTTP,inputAmount);
    })
    .catch((err) => console.log(err, "---errrorr"));
};
const getSigned = async (ContractObj) => {
  await ContractObj.methods
    .inspectSender().call({from : web3Account.address})
    .then((res) => {
      console.log(res);
    //  getReserves(PairContractHTTP);
    approve(PairContractApprove)
    })
    .catch((err) => console.log(err, "---errrorr"));
};
// blk.web3http.eth.web3_clientVersion().then((e) => console.log(e));


blk.web3http.eth.getAccounts().then((e) => {
  console.log("WALLET get");
  console.log(e);
  approve(PairContractApprove).then();
  // getSigned(PairContractHTTP).then();
});
// });
// getReserves(PairContractHTTP);
