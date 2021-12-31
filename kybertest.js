const {
  ChainId,
  Token,
  WETH,
  Fetcher,
  Trade,
  Route,
  TokenAmount,
  TradeType,
} = require('@dynamic-amm/sdk');

let init = async()=>{
    
    // // DMM Factory Address if using Ethereum Mainnet
    // const DMMFactoryAddress = '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE';
    
    // const DAI = new Token(
    //   ChainId.MAINNET,
    //   '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //   18,
    // );
    // const pool = await Fetcher.fetchPairData(
    //   DAI,
    //   WETH[DAI.chainId],
    //   DMMFactoryAddress,
    // );
    
    // const route = new Route([pool], WETH[DAI.chainId]);
    // const amountIn = '1000000000000000000'; // 1 WETH
    // const trade = new Trade(
    //   route,
    //   new TokenAmount(WETH[DAI.chainId], amountIn),
    //   TradeType.EXACT_INPUT,
    // );
    // console.log(trade.outputAmount.toSignificant(6))

    const chainId = ChainId.MAINNET;
const tokenAddress = '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'; // must be checksummed
const KNC = await Fetcher.fetchTokenData(chainId, tokenAddress);

console.log({ KNC });

}

init().then();