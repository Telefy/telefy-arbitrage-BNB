const  kybersdk = require('@dynamic-amm/sdk');
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed1.binance.org/')
const init = async () => {

    // DMM Factory Address if using Ethereum Mainnet
    const DMMFactoryAddress = '0x878dFE971d44e9122048308301F540910Bbd934c';
    let token0 =  await kybersdk.Fetcher.fetchTokenData(
        kybersdk.ChainId.BSCMAINNET, 
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        provider
        );
    let token1 =  await kybersdk.Fetcher.fetchTokenData(
        kybersdk.ChainId.BSCMAINNET, 
        "0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24",
        provider
        );
        const pairs = await kybersdk.Fetcher.fetchPairData(
            token0,
            token1,
            DMMFactoryAddress,
            provider
        );
            
        const usdcWethPair = new kybersdk.Pair(pairs[0].address,
            new kybersdk.TokenAmount(token0,"92559459806882155380147"),
            new kybersdk.TokenAmount(token1, "243128875660416444019814"),
            new kybersdk.TokenAmount(token0,"103093196982496651777077"),
            new kybersdk.TokenAmount(token1, "264196350011645436813670"),
            pairs[0].fee,
            pairs[0].amp
          )

        // console.log(JSON.stringify(usdcWethPair))
    
    const route = new kybersdk.Route([usdcWethPair], token1,token0);
    const amountIn = 2542.62 * 10 ** 18; // 1 WETH
    const trade = await new kybersdk.Trade(
      route,
      new kybersdk.TokenAmount(token1, amountIn),
      kybersdk.TradeType.EXACT_INPUT,
    );
    
    let usdcOutputWeth  = trade.outputAmount.toSignificant(6)
    console.log(usdcOutputWeth)
}
init()


// ["0x6170B6d96167346896169b35e1E9585feAB873bb","0xE84ec9cde7F8E45C68668437634c1C0B2dE3296C","0x4B7BedeB55e63e06A38B3D1E9daabc362d451032","0x97B70afEF0cAC0247FdFe321c5f0100083E408A3","0x506C96435aD266a4B01C767126b6023a6A9bdDe1"]