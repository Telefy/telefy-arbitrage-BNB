const panSdk = require('@pancakeswap/sdk');
const init = async () => {



 
    const WBNB = new panSdk.Token(1, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18)

    const BUSD = new panSdk.Token(1, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18)
    // new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
    const usdcWethPair = new panSdk.Pair(
        new panSdk.TokenAmount(WBNB,"452634086962616530070983"),
        new panSdk.TokenAmount(BUSD, "248055684356586547919150000"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 10 * 10 ** 18;

   const trade =  new panSdk.Trade(
        new panSdk.Route([usdcWethPair], WBNB,BUSD),
        new panSdk.TokenAmount(WBNB, usdcInput),
        panSdk.TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();