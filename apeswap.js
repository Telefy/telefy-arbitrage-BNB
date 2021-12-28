const apeSdk = require('love-apeswapfinance-sdk');
const init = async () => {
    const BUSD = new apeSdk.Token(1, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18)
    const WBNB = new apeSdk.Token(1, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18)

    const usdcWethPair = new apeSdk.Pair(
        new apeSdk.TokenAmount(BUSD, "12930527756064370697222"),
        new apeSdk.TokenAmount(WBNB,"7066481658877985705560152"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 1000 * 10 ** 18;

   const trade =  new apeSdk.Trade(
        new apeSdk.Route([usdcWethPair], BUSD,WBNB),
        new apeSdk.TokenAmount(BUSD, usdcInput),
        apeSdk.TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();