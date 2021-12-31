const apeSdk = require('love-apeswapfinance-sdk');
const init = async () => {
    const token0 = new apeSdk.Token(1, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18)
    const token1 = new apeSdk.Token(1, '0x05b339b0a346bf01f851dde47a5d485c34fe220c', 8)

    const usdcWethPair = new apeSdk.Pair(
        new apeSdk.TokenAmount(token0, "779979390829595059083"),
        new apeSdk.TokenAmount(token1,"50859888872576"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 1.90742 * 10 ** 18;

   const trade =  new apeSdk.Trade(
        new apeSdk.Route([usdcWethPair], token1,token0),
        new apeSdk.TokenAmount(token1, usdcInput),
        apeSdk.TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();