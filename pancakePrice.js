const sdk = {"PANCAKESWAP": require('@pancakeswap/sdk')};
// const PANCAKESWAP = require('@pancakeswap/sdk');
const {isHexString} = require("@ethersproject/bytes");
const init = async () => {



    let pancke = "PANCAKESWAP";
    const BUSD = new sdk[pancke].Token(1, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18) //busd
    const BAT = new sdk[pancke].Token(1, '0x101d82428437127bf1608f699cd651e6abf9766e', 18)  // bat
    const usdcWethPair = new sdk[pancke].Pair(
        new sdk[pancke].TokenAmount(BUSD,"1522819335159908929125"),
        new sdk[pancke].TokenAmount(BAT, "1178108569896616129786"),
      )



// console.log(usdcWethPair)
      let usdcInput  = 1000 * 10 ** 18;

   const trade =  new sdk[pancke].Trade(
        new sdk[pancke].Route([usdcWethPair], BUSD,BAT),
        new sdk[pancke].TokenAmount(BUSD, usdcInput),
        sdk[pancke].TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6)

    console.log(usdcOutputWeth)

};


init();