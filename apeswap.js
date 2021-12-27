const apeSdk = require('love-apeswapfinance-sdk');
const init = async () => {
    const token0 = new apeSdk.Token(1, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18)
    const token1 = new apeSdk.Token(1, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18)

    const usdcWethPair = new apeSdk.Pair(
        new apeSdk.TokenAmount(token0,"12936125777153130218564"),
        new apeSdk.TokenAmount(token1, "7092299686153672830505748"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 10 * 10 ** 18;

   const trade =  new apeSdk.Trade(
        new apeSdk.Route([usdcWethPair], token0,token1),
        new apeSdk.TokenAmount(token0, usdcInput),
        apeSdk.TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();