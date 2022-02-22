const sdk = {
  // "PANCAKESWAP": require('@pancakeswap/sdk'),
  "BISWAP": require('biswap-sdk')
};
const init = async () => {



    let pancke = "BISWAP";
    const token0 = new sdk[pancke].Token(1, '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', 18) //moonligh
    const token1 = new sdk[pancke].Token(1, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18)  // token0
    const usdcWethPair = new sdk[pancke].Pair(
        new sdk[pancke].TokenAmount(token0,"459928874275950825630"),
        new sdk[pancke].TokenAmount(token1, "41101153397181616921761"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 10 * 10 ** 18;

   const trade =  new sdk[pancke].Trade(
        new sdk[pancke].Route([usdcWethPair], token1,token0),
        new sdk[pancke].TokenAmount(token1, usdcInput),
        sdk[pancke].TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();