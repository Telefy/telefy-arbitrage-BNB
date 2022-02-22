const Web3 = require("web3");
const providerUrls = [
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed.binance.org/',
];
const abi = require("../exchange-apis/abis");
const factoryAddress = require("../exchange-apis/address");
const pairs = []

let count = 826;
for(let i =0; i < count; i ++){
  return new Promise(async(resolve,reject)=>{
    let randomIndex = random(0, providerUrls.length - 1)
      let httpProvider = new Web3.providers.HttpProvider(providerUrls[randomIndex], { timeout: 10000 })
      let web3http = new Web3(httpProvider);
      let PairContractHTTP = new web3http.eth.Contract(
        abi["BISWAP"].factory,
        factoryAddress.mainnet["BISWAP"].factory
      );
      let pairId = await PairContractHTTP.methods.allPairs(i).call();    
      if(i == count-1){
        fs.writeFileSync('./biswap.txt', JSON.stringify(pairs))
      }
  })
}

  