const sdk = {"PANCAKESWAP": require('@pancakeswap/sdk')};
const init = async () => {



    let pancke = "PANCAKESWAP";
    const token0 = new sdk[pancke].Token(1, '0xb1ced2e320e3f4c8e3511b1dc59203303493f382', 9) //moonligh
    const token1 = new sdk[pancke].Token(1, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18)  // token0
    const usdcWethPair = new sdk[pancke].Pair(
        new sdk[pancke].TokenAmount(token0,"3397484180456968732"),
        new sdk[pancke].TokenAmount(token1, "30041217805292651878"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 1 * 10 ** 18;

   const trade =  new sdk[pancke].Trade(
        new sdk[pancke].Route([usdcWethPair], token1,token0),
        new sdk[pancke].TokenAmount(token1, usdcInput),
        sdk[pancke].TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();