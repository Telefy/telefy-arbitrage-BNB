const { ChainId, Token, Price, Currency,} = require("@uniswap/sdk");
const { CurrencyAmount, Percent, TradeType } = require('@uniswap/sdk-core');
const uniSdkV2 = require('@uniswap/v2-sdk');
// const WETH = WETHs[ChainId.MAINNET];
// const ABC = new Token(
//   ChainId.MAINNET,
//   "0xabc0000000000000000000000000000000000000",
//   18,
//   "ABC"
// );

const token0 = new Token(1, '0x0f7f961648ae6db43c75663ac7e5414eb79b5704', 18)
const token1 = new Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18)

const USDC = new Token(
    1,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C'
  )


  const amountOut = CurrencyAmount.fromRawAmount(USDC, 100_000e6);
  const stablecoin = amountOut.currency
  console.log(stablecoin)

  const pair12 = new uniSdkV2.Pair(
    CurrencyAmount.fromRawAmount(token0,11503405180615047722972075),
    CurrencyAmount.fromRawAmount(token1,413919615036162816501),
  )
  
const price = new Price(
    token0,
    token1,
  "10000000000000000000",
  "10000000000000000000"
);

const routes = new uniSdkV2.Route([pair12], token0,token1);
// const price = new Price(stablecoin, stablecoin, '1', '1')

console.log(routes,"---den----");
console.log(price.quote('1000'),"---den----");