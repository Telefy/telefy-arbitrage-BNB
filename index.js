const axios = require("axios");
const express = require("express");
const Web3 = require('web3');
const app = express();
const path = require("path");
const router = express.Router();
const mysql = require("mysql");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const baseTokens = require("./tokens.json");
const sdk = {
  "PANCAKESWAP": require('@pancakeswap/sdk'),
  "APESWAP": require('love-apeswapfinance-sdk')
};
const  kybersdk = require('@dynamic-amm/sdk');
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed1.binance.org/')
const KYBERFACTORY = '0x878dFE971d44e9122048308301F540910Bbd934c';

const baseArray = [];
for (const property in baseTokens) {
  baseArray.push(property);
}
var con = mysql.createConnection({
  host: "testdev.rungila.com",
  user: "user1",
  password: "_kVvPeE(S!#[XE_85@",
  database: "arbitrage",
});




con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
let table = [];
let exchanges;
let checkEvent = false;
let intervals = {};
//**********************************    LOGIN SOCKET ********************************//
io.use(async (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.client) {
    table = [];
    await con.query(
      `SELECT name as exchange_type,exchange_id FROM m_exchanges where network_type = 'BSC' order by exchange_id asc`,
      async (err, result) => {
        if (err) throw err;
        exchanges = result;
        if (exchanges.length > 0) {
          for (let ex = 0; ex < exchanges.length; ex++) {
            new Promise(async (resolve, rejects) => {
              await con.query(
                `SELECT * FROM m_common_pair where exchange_id = '${exchanges[ex].exchange_id}' ORDER by pair_id ASC `,
                async (err, exresult) => {
                  if (err) throw err;
                  let i = 0;
                    exresult.forEach((element) => {
                      var getIndex = table.findIndex(
                        (pair) =>
                          pair.token0 === element.token0 &&
                          pair.token1 === element.token1
                      );
                      if(getIndex >= 0){
                        table[getIndex].exchanges.push({
                          name: `${exchanges[ex].exchange_type}`,
                          pairtoken: element.pairtoken,
                          price0: "",
                          price1: "",
                        });
                      } else {
                        table.push({
                          symbol: element.symbol,
                          token0: element.token0,
                          token1: element.token1,
                          decimal0: element.decimal0,
                          decimal1: element.decimal1,
                          exchanges: [
                            {
                              name: `${exchanges[ex].exchange_type}`,
                              pairtoken: element.pairtoken,
                              price0: "",
                              price1: "",
                            },
                          ],
                        });
                      }                      
                      i++;
                      if (exresult.length == i) {
                        resolve(1);
                      }
                      if (exchanges.length - 1 == ex) {
                        next();
                      }
                    });
                    if (exresult.length == table.length) {
                      resolve(1);
                    }
                  
                }
              );
            });
          }
        }
      }
    );
  }
}).on("connection", function (socket) {
  if (!checkEvent) {
    let setCB = async (value, i) => {
    //  intervals[i] = setInterval(async () => {
        let allArbitrage = [];
        for (let e = 0; e < value.exchanges.length; e++) {

          
          let baseInfo = {
            pairId: value.exchanges[e].pairtoken.toString(),
            exchange: value.exchanges[e].name.toString(),
            token0: value.token0.toString(),
            token1: value.token1.toString(),
            decimal0: value.decimal0,
            decimal1: value.decimal1,
            symbol0:  value.symbol.split("/")[0],
            symbol1:  value.symbol.split("/")[1],
          }
          let otherExchanges = value.exchanges.filter(function(element){            
            return element.name !== value.exchanges[e].name;
        });
          let getExchangeInput = new Promise(async (resolve, reject) => {
           
  
            let staticPathArray = ['BUSD'];
  
            let modifiedBaseArray = [];

            let fromToken;
            let toToken;
            let baseTokensEquals = false;
            if(baseTokens[staticPathArray[staticPathArray.length-1]].token.toLowerCase() == baseInfo.token0.toLowerCase()){   // BUSD == BUSD
              fromToken = baseTokens[staticPathArray[staticPathArray.length-1]].token.toString();
              toToken = baseInfo.token1;
              baseTokensEquals = true;
            } else {
              fromToken = baseTokens[staticPathArray[staticPathArray.length-1]].token.toString();;
              toToken = baseInfo.token0;
              baseTokensEquals = false;
            }
  
            let usdcResult = await checkPairExist(fromToken, toToken,baseInfo);
            if (usdcResult) {
              if(baseTokens[staticPathArray[staticPathArray.length-1]].token.toLowerCase() == baseInfo.token0.toLowerCase()){

                staticPathArray.push(baseInfo.symbol1)
              } else {
                staticPathArray.push(baseInfo.symbol0)
              }
            } else {
              modifiedBaseArray = await modifyBaseArray(baseArray, staticPathArray);
              staticPathArray = await recFunction(staticPathArray, modifiedBaseArray,baseInfo);

            }
            let inputTradeResult;
            if(baseTokens[staticPathArray[0]].token.toLowerCase() == baseInfo.token0.toLowerCase()){
              inputTradeResult = [[{
                "inputAmount": "1000",
                "outputAmount": "1000",
                "dollarWorth": "$1000",
              },{
                "inputAmount": "5000",
                "outputAmount": "5000",
                "dollarWorth": "$5000",
              },{
                "inputAmount": "10000",
                "outputAmount": "10000",
                "dollarWorth": "$10000",
              }]]            

            } else {
              inputTradeResult = await inputTradecheck(staticPathArray,baseInfo);
            }
            
            let outPutTradeResult = await outputTradecheck(inputTradeResult[inputTradeResult.length-1],baseInfo);

            resolve(outPutTradeResult)

          })

          let uniswapInput = await getExchangeInput;
          // console.log(uniswapInput);
            let worthThourArbit = await checkOtherExchange(uniswapInput,otherExchanges,baseInfo);
            allArbitrage.push(worthThourArbit);          
           
        } 
        let tokenIds = value.token0.toString()+value.token1.toString();
        io.sockets.emit(tokenIds,
          allArbitrage
        );
      // }, 60000);
    };
    //['BUSD', 'MOONLIGHT']  // AUCTAL PAIR  : CAKE/DIA
    let inputTradecheck = async (staticPathArray,baseInfo) => {
      return new Promise(async (resolve,reject) => {
        let busdInput = []
         for(let i=0; i < staticPathArray.length; i++){           
          
             let token0Address = baseTokens[staticPathArray[i]].token.toString();
          
             let token1Address;
            if(parseInt(i+2) == parseInt(staticPathArray.length)){
               token1Address = baseInfo.token0
            } else {
                token1Address = baseTokens[staticPathArray[i+1]].token.toString()
              }
               

             let decimal0 = baseTokens[staticPathArray[i]].decimal;
             let decimal1;
             if (parseInt(i + 2) == parseInt(staticPathArray.length)) {
               decimal1 = baseInfo.decimal0;
             } else {
               decimal1 = baseTokens[staticPathArray[i + 1]].decimal;
             }

             let usdcInputCoins = [
              "1000000000000000000000",
              "5000000000000000000000",
              "10000000000000000000000",
            ];
            let usdcInputDollars = ["$1000", "$5000", "$10000"];



             if (baseInfo.exchange == "KYBER") {
               let token0 = await kybersdk.Fetcher.fetchTokenData(
                 kybersdk.ChainId.BSCMAINNET,
                 Web3.utils.toChecksumAddress(token0Address),
                 provider
               );
               let token1 = await kybersdk.Fetcher.fetchTokenData(
                 kybersdk.ChainId.BSCMAINNET,
                 Web3.utils.toChecksumAddress(token1Address),
                 provider
               );
               const pairs = await kybersdk.Fetcher.fetchPairData(
                 token0,
                 token1,
                 KYBERFACTORY,
                 provider
               );
               if(pairs.length > 0){
                 
                 let getPairId = await checkPairExist(
                  token0Address,
                  token1Address,
                  baseInfo
                );
                if (getPairId) {
  
                  let getReserves = await checkReservesTrade(pairs);
                   if (getReserves.length > 0) {
                     let getToken0Api = await token0Api(getPairId);
                     let contractToken0 = getToken0Api.toLowerCase();
                     let checkWIthContractToken0 = token0Address.toLowerCase();
                     let reserve0;
                     let reserve1;
                     let vReserve0;
                     let vReserve1;
                     let pairIndex = getReserves[0].pairIdIndex;
                     if (contractToken0 === checkWIthContractToken0) {
                       reserve0 = getReserves[0].reserve0;
                       reserve1 = getReserves[0].reserve1;
                       vReserve0 = getReserves[0].vReserve0;
                       vReserve1 = getReserves[0].vReserve1;
                     } else {
                       reserve0 = getReserves[0].reserve1;
                       reserve1 = getReserves[0].reserve0;
                       vReserve0 = getReserves[0].vReserve1;
                       vReserve1 = getReserves[0].vReserve0;
                     }
                     const usdcWethPair = new kybersdk.Pair(
                       pairs[pairIndex].address,
                       new kybersdk.TokenAmount(token0, reserve0.toString()),
                       new kybersdk.TokenAmount(token1, reserve1.toString()),
                       new kybersdk.TokenAmount(token0, vReserve0.toString()),
                       new kybersdk.TokenAmount(token1, vReserve1.toString()),
                       pairs[pairIndex].fee,
                       pairs[pairIndex].amp
                     );

                     let tempArr = [];
                     if (busdInput.length > 0) {
                      let busdInputLastElement = busdInput[busdInput.length - 1];
                      for (
                        let uCoin = 0;
                        uCoin < busdInputLastElement.length;
                        uCoin++
                      ) {
                        let input = (
                          busdInputLastElement[uCoin].outputAmount *
                          10 ** parseInt(decimal0)
                        ).toFixed();
                        input = Number(input).toLocaleString().replace(/,/g, "");
                        const route = new kybersdk.Route([usdcWethPair], token0,token1);
                        const trade = await new kybersdk.Trade(
                          route,
                          new kybersdk.TokenAmount(token0, input),
                          kybersdk.TradeType.EXACT_INPUT,
                        );
 
                        tempArr.push({
                          inputAmount: trade.inputAmount.toSignificant(6),
                          outputAmount: trade.outputAmount.toSignificant(6),
                          dollarWorth: usdcInputDollars[uCoin],
                        });
                      }
                    } else {
                      for (
                        let uCoin = 0;
                        uCoin < usdcInputCoins.length;
                        uCoin++
                      ) {
                        const route = new kybersdk.Route([usdcWethPair], token0,token1);
                        const trade = await new kybersdk.Trade(
                          route,
                          new kybersdk.TokenAmount(token0, usdcInputCoins[uCoin]),
                          kybersdk.TradeType.EXACT_INPUT,
                        );
 
                        tempArr.push({
                          inputAmount: trade.inputAmount.toSignificant(6),
                          outputAmount: trade.outputAmount.toSignificant(6),
                          dollarWorth: usdcInputDollars[uCoin],
                        });
                      }
                    }
                    
                   busdInput.push(tempArr);
                   }
                }
               }
             } else {
               let token0 = new sdk[baseInfo.exchange].Token(
                 1,
                 Web3.utils.toChecksumAddress(token0Address),
                 decimal0
               );
               let token1 = new sdk[baseInfo.exchange].Token(
                 1,
                 Web3.utils.toChecksumAddress(token1Address),
                 decimal1
               );

               let getPairId = await checkPairExist(
                 token0Address,
                 token1Address,
                 baseInfo
               );
               if (getPairId) {
                 let getReserves = await checkReserves(getPairId);
                 if (getReserves.length > 0) {
                   let getToken0Api = await token0Api(getPairId);
                   let contractToken0 = getToken0Api.toLowerCase();
                   let checkWIthContractToken0 = token0Address.toLowerCase();
                   let reserve0;
                   let reserve1;
                   if (contractToken0 === checkWIthContractToken0) {
                     reserve0 = getReserves[0].reserve0;
                     reserve1 = getReserves[0].reserve1;
                   } else {
                     reserve0 = getReserves[0].reserve1;
                     reserve1 = getReserves[0].reserve0;
                   }
                  

                   let pair = await new sdk[baseInfo.exchange].Pair(
                     new sdk[baseInfo.exchange].TokenAmount(
                       token0,
                       reserve0.toString()
                     ),
                     new sdk[baseInfo.exchange].TokenAmount(
                       token1,
                       reserve1.toString()
                     )
                   );

                   let tempArr = [];
                   if (busdInput.length > 0) {
                     let busdInputLastElement = busdInput[busdInput.length - 1];
                     for (
                       let uCoin = 0;
                       uCoin < busdInputLastElement.length;
                       uCoin++
                     ) {
                       let input = (
                         busdInputLastElement[uCoin].outputAmount *
                         10 ** parseInt(decimal0)
                       ).toFixed();
                       input = Number(input).toLocaleString().replace(/,/g, "");
                       const trade = await new sdk[baseInfo.exchange].Trade(
                         new sdk[baseInfo.exchange].Route(
                           [pair],
                           token0,
                           token1
                         ),
                         new sdk[baseInfo.exchange].TokenAmount(token0, input),
                         sdk[baseInfo.exchange].TradeType.EXACT_INPUT
                       );

                       tempArr.push({
                         inputAmount: trade.inputAmount.toSignificant(6),
                         outputAmount: trade.outputAmount.toSignificant(6),
                         dollarWorth: usdcInputDollars[uCoin],
                       });
                     }
                   } else {
                     for (
                       let uCoin = 0;
                       uCoin < usdcInputCoins.length;
                       uCoin++
                     ) {
                       const trade = await new sdk[baseInfo.exchange].Trade(
                         new sdk[baseInfo.exchange].Route(
                           [pair],
                           token0,
                           token1
                         ),
                         new sdk[baseInfo.exchange].TokenAmount(
                           token0,
                           usdcInputCoins[uCoin]
                         ),
                         sdk[baseInfo.exchange].TradeType.EXACT_INPUT
                       );

                       tempArr.push({
                         inputAmount: trade.inputAmount.toSignificant(6),
                         outputAmount: trade.outputAmount.toSignificant(6),
                         dollarWorth: usdcInputDollars[uCoin],
                       });
                     }
                   }
                   busdInput.push(tempArr);
                 }
               }
             }

             
             if(parseInt(i+2) == parseInt(staticPathArray.length)){
              resolve(busdInput)
              break;
            }

         }
      })
    }

    let outputTradecheck = async (inputAmounts, baseInfo) => {
      return new Promise(async (resolve, reject) => {
        let baseInput = [];

        if (baseInfo.exchange == "KYBER") {
          let token0 = await kybersdk.Fetcher.fetchTokenData(
            kybersdk.ChainId.BSCMAINNET,
            Web3.utils.toChecksumAddress(baseInfo.token0),
            provider
          );
          let token1 = await kybersdk.Fetcher.fetchTokenData(
            kybersdk.ChainId.BSCMAINNET,
            Web3.utils.toChecksumAddress(baseInfo.token1),
            provider
          );
          const pairs = await kybersdk.Fetcher.fetchPairData(
            token0,
            token1,
            KYBERFACTORY,
            provider
          );
          if (pairs.length > 0) {
            let getReserves = await checkReservesTrade(pairs);
            if (getReserves.length > 0) {
              let pairIndex = getReserves[0].pairIdIndex;
              let getToken0Api = await token0Api(pairs[pairIndex].address);
              let contractToken0 = getToken0Api.toLowerCase();
              let checkWIthContractToken0 = baseInfo.token0.toLowerCase();
              let reserve0;
              let reserve1;
              let vReserve0;
              let vReserve1;
              if (contractToken0 === checkWIthContractToken0) {
                reserve0 = getReserves[0].reserve0;
                reserve1 = getReserves[0].reserve1;
                vReserve0 = getReserves[0].vReserve0;
                vReserve1 = getReserves[0].vReserve1;
              } else {
                reserve0 = getReserves[0].reserve1;
                reserve1 = getReserves[0].reserve0;
                vReserve0 = getReserves[0].vReserve1;
                vReserve1 = getReserves[0].vReserve0;
              }
              const usdcWethPair = await new kybersdk.Pair(
                pairs[pairIndex].address,
                new kybersdk.TokenAmount(token0, reserve0.toString()),
                new kybersdk.TokenAmount(token1, reserve1.toString()),
                new kybersdk.TokenAmount(token0, vReserve0.toString()),
                new kybersdk.TokenAmount(token1, vReserve1.toString()),
                pairs[pairIndex].fee,
                pairs[pairIndex].amp
              );

              for (let uCoin = 0; uCoin < inputAmounts.length; uCoin++) {
                let input = (
                  inputAmounts[uCoin].outputAmount *
                  10 ** parseInt(baseInfo.decimal0)
                ).toFixed();
                input = Number(input).toLocaleString().replace(/,/g, "");
                const route = new kybersdk.Route(
                  [usdcWethPair],
                  token0,
                  token1
                );
                const trade = await new kybersdk.Trade(
                  route,
                  new kybersdk.TokenAmount(token0, input),
                  kybersdk.TradeType.EXACT_INPUT
                );

                baseInput.push({
                  inputAmount: trade.inputAmount.toSignificant(6),
                  outputAmount: trade.outputAmount.toSignificant(6),
                  dollarWorth: inputAmounts[uCoin].dollarWorth,
                });
              }

              resolve(baseInput);
            }
          }
        } else {
          let token0 = new sdk[baseInfo.exchange].Token(
            1,
            Web3.utils.toChecksumAddress(baseInfo.token0),
            baseInfo.decimal0
          );
          let token1 = new sdk[baseInfo.exchange].Token(
            1,
            Web3.utils.toChecksumAddress(baseInfo.token1),
            baseInfo.decimal1
          );

          let getReserves = await checkReserves(baseInfo.pairId);
          if (getReserves.length > 0) {
            let getToken0Api = await token0Api(baseInfo.pairId);
            let contractToken0 = getToken0Api.toLowerCase();
            let checkWIthContractToken0 = baseInfo.token0.toLowerCase();
            let reserve0;
            let reserve1;
            if (contractToken0 === checkWIthContractToken0) {
              reserve0 = getReserves[0].reserve0;
              reserve1 = getReserves[0].reserve1;
            } else {
              reserve0 = getReserves[0].reserve1;
              reserve1 = getReserves[0].reserve0;
            }

            let pair = await new sdk[baseInfo.exchange].Pair(
              new sdk[baseInfo.exchange].TokenAmount(
                token0,
                reserve0.toString()
              ),
              new sdk[baseInfo.exchange].TokenAmount(
                token1,
                reserve1.toString()
              )
            );

            for (let uCoin = 0; uCoin < inputAmounts.length; uCoin++) {
              let input = (
                inputAmounts[uCoin].outputAmount *
                10 ** parseInt(baseInfo.decimal0)
              ).toFixed();
              input = Number(input).toLocaleString().replace(/,/g, "");
              const trade = await new sdk[baseInfo.exchange].Trade(
                new sdk[baseInfo.exchange].Route([pair], token0, token1),
                new sdk[baseInfo.exchange].TokenAmount(token0, input),
                sdk[baseInfo.exchange].TradeType.EXACT_INPUT
              );
              baseInput.push({
                inputAmount: inputAmounts[uCoin].outputAmount,
                outputAmount: trade.outputAmount.toSignificant(6),
                dollarWorth: inputAmounts[uCoin].dollarWorth,
              });
            }
            resolve(baseInput);
          }
        }
      });
    };

      let modifyBaseArray = async (baseArray,staticPathArray) => {
        return new Promise(async(resolve,reject) => {
          
          let newLayerArr = []
          for(let i =0; i < baseArray.length; i++){
            let index = staticPathArray.indexOf(baseArray[i]);
            if(0 > index){
               newLayerArr.push(baseArray[i])
            }
          }            
              
          resolve(newLayerArr);
        })
      }
      /// staticPathArray = [BUSD]
      // modifiedBaseArray = [WBNB,CAKE]
    let recFunction = (staticPathArray, modifiedBaseArray,baseInfo) => {
      if(modifiedBaseArray.length == 0) return false;
      
      
      return new Promise(async(resolve,reject) => {
        
        let lastElement = staticPathArray[staticPathArray.length-1];
        let pairsAvailable = [];
        let pairsNotAvailable = [];
        let secondeLoopExcute = true;

        for(let i = 0; i < modifiedBaseArray.length; i++){
          let matchedFlag;
          let iTokenFlag;          
             matchedFlag = await checkPairAvailability(lastElement,modifiedBaseArray[i],baseInfo,pairsAvailable,pairsNotAvailable)
              if(matchedFlag.status){
                if(matchedFlag.avaliablePush) {
                  pairsAvailable.push([lastElement,modifiedBaseArray[i]])
                }
                if(matchedFlag.notAvailablePush) {
                  pairsNotAvailable.push([lastElement,modifiedBaseArray[i]])
                }
                iTokenFlag = await checkPairAvailability(modifiedBaseArray[i], baseInfo.symbol0,baseInfo,pairsAvailable,pairsNotAvailable);
                if(iTokenFlag.avaliablePush) {
                  pairsAvailable.push([modifiedBaseArray[i],baseInfo.symbol0])
                }
                if(iTokenFlag.notAvailablePush) {
                  pairsNotAvailable.push([modifiedBaseArray[i],baseInfo.symbol0])
                }
              } 
          
          if(matchedFlag.status && iTokenFlag.status) {
              staticPathArray.push(modifiedBaseArray[i], baseInfo.symbol0)
              secondeLoopExcute = false;
              resolve(staticPathArray)
              break;
          }
      }
      if(secondeLoopExcute){

        for(let j = 0; j < modifiedBaseArray.length; j++){
          staticPathArray.push(modifiedBaseArray[j])
            let innerModifiedBaseArray = await modifyBaseArray(baseArray, staticPathArray)
           const resFn =  await recFunction(staticPathArray, innerModifiedBaseArray,baseInfo);
           if(resFn && resFn.length > 0) {
            resolve(resFn)
            break;
           }
      }
      }

      resolve([]);


      })
    }

    let checkpairsAvailable =async(fromToken,toToken,pairsAvailable) => {
     return new Promise(async (resolve,reject)=> {

       if(pairsAvailable.length == 0){
         resolve(false)
       } else {
          for(let i =0; i < pairsAvailable.length; i++){
             let pairs = pairsAvailable[i];
             let checkFromToken = pairsAvailable[i].indexOf(fromToken)
             let checkToToken = pairsAvailable[i].indexOf(toToken)
             if(checkFromToken >= 0 && checkToToken >= 0){
               resolve(true)
             } else {
               if(i == pairsAvailable.length -1){
                 resolve(false)
               }
             }
          }
       }
     })

    }
    let checkpairsNotAvailable =async(fromToken,toToken,pairsNotAvailable) => {
      return new Promise(async (resolve,reject)=> {

        if(pairsNotAvailable.length == 0){
          resolve(false)
        } else {
          for(let i =0; i < pairsNotAvailable.length; i++){
            let pairs = pairsNotAvailable[i];
            let checkFromToken = pairsNotAvailable[i].indexOf(fromToken)
            let checkToToken = pairsNotAvailable[i].indexOf(toToken)
            if(checkFromToken >= 0 && checkToToken >= 0){
              resolve(true)
            } else {
              if(i == pairsNotAvailable.length -1){
                resolve(false)
              }
            }
         }
        }
      })

    }


    let checkPairAvailability = async (fromToken, toToken,baseInfo,pairsAvailable,pairsNotAvailable) => {
      return new Promise(async(resolve,reject)=>{
        let checkAvaliablePair = await checkpairsAvailable(fromToken, toToken,pairsAvailable);
        let checkNotAvaliablePair = await checkpairsNotAvailable(fromToken, toToken,pairsNotAvailable)
        if (checkAvaliablePair) {
           resolve({
             status: true,
             avaliablePush: false,
             notAvailablePush:false
           });
        } else if (checkNotAvaliablePair) {
          resolve({
            status: false,
            avaliablePush: false,
            notAvailablePush:false
          });
        } else {
           toToken = baseTokens[toToken] ? baseTokens[toToken].token.toString() : baseInfo.token0;
          const res = await checkPairExist(baseTokens[fromToken].token.toString(), toToken,baseInfo);
          if (res) {

            resolve({
              status: true,
              avaliablePush: true,
              notAvailablePush:false
            });
          } else {
            resolve({
              status: false,
              avaliablePush: false,
              notAvailablePush:true
            });
          }
        }
      })
    };


    let checkReserves = async (pairId) => {
      return new Promise(async (resolve,reject)=> {

        let config = {
          method: "GET",
          url: `http://localhost:5000/getReserves/${pairId}`,
          headers: {
            "Content-Type": "application/json",
          },
        };
        axios(config).then(async (response) => {
          if (response.data.data.length > 0){
             resolve(response.data.data)
          } else {
            resolve([])
          }
        });
      })
    };
    let checkReservesTrade = async (pairIds) => {
      return new Promise(async (resolve,reject)=> {

        for(let i =0; i < pairIds.length; i++){

          let config = {
            method: "GET",
            url: `http://localhost:5000/getTradeInfo/${pairIds[i].address}`,
            headers: {
              "Content-Type": "application/json",
            },
          };
          axios(config).then(async (response) => {
            if (response.data.data.length > 0){
                if(response.data.data[0].reserve0 !== "0") {
                  response.data.data[0].pairIdIndex = i
                  resolve(response.data.data)
                }
            } else {
              resolve([])
            }
          });
        }

      })
    };

    let token0Api = async (pairId) => {
      return new Promise(async (resolve,reject)=> {

        let config = {
          method: "GET",
          url: `http://localhost:5000/checkPairToken/${pairId}`,
          headers: {
            "Content-Type": "application/json",
          },
        };
        axios(config).then(async (response) => {
          if (response.data.data){
             resolve(response.data.data)
          } else {
            resolve()
          }
        });
      })
    };

    let checkPairExist = async (fromToken, toToken,baseInfo) => {
      return new Promise(async (resolve,reject)=> {

      
        let postData = {
            token0: fromToken, 
            token1: toToken,
            exchange: baseInfo.exchange
          };
        let config = {
          method: "POST",
          url: `http://localhost:5000/checkPair/`,
          headers: {
            "Content-Type": "application/json",
          },
          data: postData,
        };
        axios(config).then(async (response) => {
          if (response.data.data){
             let checkAddress = await checkValidAddress(response.data.data)
             if(checkAddress){
               resolve(response.data.data)
             } else {
               resolve()
             }
          } else {
            resolve()
          }
        });
      })
    };

    let checkValidAddress = async(address) => {
      return new Promise(async (resolve,reject) =>{
        if(address.toString() !== "0x0000000000000000000000000000000000000000"){
          resolve(true)
        } else {
          resolve(false)
        }
      })
    }


    let checkOtherExchange = async (baseOutputtValue,exchanges,baseInfo) => {      
      let arbitrage = {}
      if(baseOutputtValue.length > 0){ 

        for(let j=0; j < exchanges.length; j++){
            let otherPariAddr = exchanges[j].pairtoken.toString();
            let otherExchange = exchanges[j].name.toString();
            let getExchangeOutput = new Promise(async (resolve, reject) => {

              if (otherExchange == "KYBER") {
                let token0 = await kybersdk.Fetcher.fetchTokenData(
                  kybersdk.ChainId.BSCMAINNET,
                  Web3.utils.toChecksumAddress(baseInfo.token0),
                  provider
                );
                let token1 = await kybersdk.Fetcher.fetchTokenData(
                  kybersdk.ChainId.BSCMAINNET,
                  Web3.utils.toChecksumAddress(baseInfo.token1),
                  provider
                );
                const pairs = await kybersdk.Fetcher.fetchPairData(
                  token0,
                  token1,
                  KYBERFACTORY,
                  provider
                );
                if (pairs.length > 0) {
                  let getReserves = await checkReservesTrade(pairs);
                  if (getReserves.length > 0) {
                    let pairIndex = getReserves[0].pairIdIndex;
                    let getToken0Api = await token0Api(pairs[pairIndex].address);
                    let contractToken0 = getToken0Api.toLowerCase();
                    let checkWIthContractToken0 = baseInfo.token0.toLowerCase();
                    let reserve0;
                    let reserve1;
                    let vReserve0;
                    let vReserve1;
                    if (contractToken0 === checkWIthContractToken0) {
                      reserve0 = getReserves[0].reserve0;
                      reserve1 = getReserves[0].reserve1;
                      vReserve0 = getReserves[0].vReserve0;
                      vReserve1 = getReserves[0].vReserve1;
                    } else {
                      reserve0 = getReserves[0].reserve1;
                      reserve1 = getReserves[0].reserve0;
                      vReserve0 = getReserves[0].vReserve1;
                      vReserve1 = getReserves[0].vReserve0;
                    }
                    const usdcWethPair = await new kybersdk.Pair(
                      pairs[pairIndex].address,
                      new kybersdk.TokenAmount(token0, reserve0.toString()),
                      new kybersdk.TokenAmount(token1, reserve1.toString()),
                      new kybersdk.TokenAmount(token0, vReserve0.toString()),
                      new kybersdk.TokenAmount(token1, vReserve1.toString()),
                      pairs[pairIndex].fee,
                      pairs[pairIndex].amp
                    );
                    let otherOutputs = []
                    for(let uInputs = 0; uInputs < baseOutputtValue.length; uInputs++ ){
                        let decimalInputValue = (baseOutputtValue[uInputs].outputAmount * 10 ** parseInt(baseInfo.decimal1)).toFixed();
                        decimalInputValue = Number(decimalInputValue).toLocaleString().replace(/,/g,"")
                      const route = new kybersdk.Route(
                        [usdcWethPair],
                        token1,
                        token0
                      );
                      const pairTrade = await new kybersdk.Trade(
                        route,
                        new kybersdk.TokenAmount(token1, decimalInputValue),
                        kybersdk.TradeType.EXACT_INPUT
                      );
            
                      let diffExchange = pairTrade.outputAmount.toSignificant(6) - baseOutputtValue[uInputs].inputAmount;
                      let percent = diffExchange/baseOutputtValue[uInputs].inputAmount*100;
                      
                      otherOutputs.push({exchage:`${baseInfo.exchange}(${baseOutputtValue[uInputs].inputAmount})->${otherExchange}(${pairTrade.outputAmount.toSignificant(6)}): (${baseOutputtValue[uInputs].dollarWorth})`, outputValue: pairTrade.outputAmount.toSignificant(6),otherExinput: baseOutputtValue[uInputs].outputAmount, BaseInput: baseOutputtValue[uInputs].inputAmount,arbitRange:percent,baseToken0: baseInfo.token0,baseToken1: baseInfo.token1})
                    }
            
                    resolve(otherOutputs);
                  }
                }
              } else {
                
                let getReserves = await checkReserves(otherPariAddr);
                let getToken0Api = await token0Api(otherPariAddr);
                  let contractToken0 = getToken0Api.toLowerCase();
                  let checkWIthContractToken0 = baseInfo.token0.toLowerCase();
                  let reserve0;
                  let reserve1;
                  if(contractToken0 === checkWIthContractToken0) {
                    reserve0 = getReserves[0].reserve0;
                    reserve1 = getReserves[0].reserve1;
                  } else {
                    reserve0 = getReserves[0].reserve1;
                    reserve1 = getReserves[0].reserve0;
                  }
  
                  let token0 = new sdk[otherExchange].Token(1, Web3.utils.toChecksumAddress(baseInfo.token0), baseInfo.decimal0);
                  let token1 = new sdk[otherExchange].Token(1, Web3.utils.toChecksumAddress(baseInfo.token1), baseInfo.decimal1);
  
                  let pair = await new sdk[otherExchange].Pair(
                    new sdk[otherExchange].TokenAmount(token0,reserve0.toString()),
                    new sdk[otherExchange].TokenAmount(token1, reserve1.toString()),
                  )
  
                  let otherOutputs = []
  
                  for(let uInputs = 0; uInputs < baseOutputtValue.length; uInputs++ ){
                    let decimalInputValue = (baseOutputtValue[uInputs].outputAmount * 10 ** parseInt(baseInfo.decimal1)).toFixed();
                    decimalInputValue = Number(decimalInputValue).toLocaleString().replace(/,/g,"")
                    let pairTrade = new sdk[otherExchange].Trade(
                      new sdk[otherExchange].Route([pair], token1, token0),
                      new sdk[otherExchange].TokenAmount(token1, decimalInputValue),
                      sdk[otherExchange].TradeType.EXACT_INPUT
                    );
                    let diffExchange = pairTrade.outputAmount.toSignificant(6) - baseOutputtValue[uInputs].inputAmount;
                    let percent = diffExchange/baseOutputtValue[uInputs].inputAmount*100;
                    
                    otherOutputs.push({exchage:`${baseInfo.exchange}(${baseOutputtValue[uInputs].inputAmount})->${otherExchange}(${pairTrade.outputAmount.toSignificant(6)}): (${baseOutputtValue[uInputs].dollarWorth})`, outputValue: pairTrade.outputAmount.toSignificant(6),otherExinput: baseOutputtValue[uInputs].outputAmount, BaseInput: baseOutputtValue[uInputs].inputAmount,arbitRange:percent,baseToken0: baseInfo.token0,baseToken1: baseInfo.token1})
                  }
                  resolve(otherOutputs)
              }
              
              
            });
  
            let getValues = await getExchangeOutput;
            
            if(arbitrage.hasOwnProperty(baseInfo.exchange)){
              arbitrage[baseInfo.exchange].push(...getValues)
            } else {
              arbitrage[baseInfo.exchange] = getValues
            }
            arbitrage['exchange'] = baseInfo.exchange
            arbitrage['tokenIds'] = baseInfo.token0.toString()+baseInfo.token1.toString()
        }
      }
      return arbitrage;
    }



    
     
    checkEvent = true;
    for (let i = 0; i < table.length; i++) {
      setCB(table[i]);
    }
  }
});

router.get("/getPrice", async (req, res, next) => {
  res.json(table);
});

router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/demo.html"));
});

app.use("/", router);
server.listen(3000);
