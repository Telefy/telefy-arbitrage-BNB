const Big = require("big.js");
const blk = require("./blockchain");
var sushiApi	= require('sushiswap-api');
const axios = require("axios");
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const mysql = require('mysql');


var con = mysql.createConnection({
  host: "testdev.rungila.com",
  user: "user1",
  password: "_kVvPeE(S!#[XE_85@",
  database: "arbitrage",
});


con.connect(function (err) {
  if (err) throw err;
   console.log("Connected!");
//   con.query(`CREATE TABLE IF NOT EXISTS zohooauth.oauthtokens ( useridentifier varchar(100) NOT NULL, accesstoken varchar(500) NOT NULL, refreshtoken varchar(500) NOT NULL, expirytime bigint(100) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1`, function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
// });
});

// let table = [{
//   symbol: "WETH-USDT",
//   exchanges: [
//     {
//       name: "uniswap",
//       pairtoken: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
//       price0:'',
//       price1:''
//     },
//     {
//       name: "sushiswap",
//       pairtoken: "0x06da0fd433c1a5d7a4faa01111c044910a184553",
//       price0:'',
//       price1:''
//     }
//   ]
// },{
//   symbol: "USDC-WETH",
//   exchanges: [
//     {
//       name: "uniswap",
//       pairtoken: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
//       price0:'',
//       price1:''
//     },
//     {
//       name: "sushiswap",
//       pairtoken: "0x397ff1542f962076d0bfe58ea045ffa2d347aca0",
//       price0:'',
//       price1:''
//     }
//   ]
// },{
//   symbol: "DAI-WETH",
//   exchanges: [
//     {
//       name: "uniswap",
//       pairtoken: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
//       price0:'',
//       price1:''
//     },
//     {
//       name: "sushiswap",
//       pairtoken: "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
//       price0:'',
//       price1:''
//     }
//   ]
// }]
let table = []
const buildArray = async (res,req,next) => {
  table = []
   await con.query(`SELECT * FROM m_common_pair where exchange_type = 'UNISWAP' limit 100`, function (err, result) {
    if (err) throw err;
    result.forEach(element => {
      // var checkPair = commonpair.filter(pair => (pair.symbol === element.symbol));      
      table.push({
          symbol: element.symbol,
          exchanges: [
            {
              name: "uniswap",
              pairtoken: element.pairtoken,
              price0:'',
              price1:''
            }
          ]
        })
    });
    if(result.length == table.length){      
      next()
    }
});

}
const addSushiSwap = async (req,res) => {
  // console.log(table,"====")
    con.query(`SELECT * FROM m_common_pair where exchange_type = 'SUSHISWAP'  limit 100`, function (err, result) {
    if (err) throw err;   
    let i=0; 
    result.forEach(element => {
      var getIndex = table.findIndex(pair => (pair.symbol === element.symbol));  
      console.log(`index:${getIndex}, pairId: ${element.pair_id}`)    
      table[getIndex].exchanges.push({
              name: "sushiswap",
              pairtoken: element.pairtoken,
              price0:'',
              price1:''
            })
            i++
    });
    if(result.length == i){      
       buildPromise(req,res)
    }
    
});
}


let allPromise = []

const buildPromise = async (req,res) => {
let j = 0;
  for(let i=0; i < table.length; i++){
    for( let exc= 0; exc < table[i].exchanges.length; exc++){
      if(table[i].exchanges[exc].name == "uniswap"){
        
        allPromise.push(new Promise((resolve,reject) => uniswapLogic(table[i].exchanges[exc],i,exc,resolve,reject)))
  
      }
      if(table[i].exchanges[exc].name == "sushiswap"){
  
        allPromise.push(new Promise((resolve,reject) => sushiswapLogic(table[i].exchanges[exc],i,exc,resolve,reject)))
  
      }
      
    }
    j++
  }
  if(j == table.length){
    Promise.all(allPromise).then((values) => {
      console.log(table,"----")
      res.json(table)
      // console.log(table[0],"--table")
    }).catch(function (error) {
      // if there's an error, log it
      // res.sendStatus(400)
      console.log(error,"===promissalll");
    });
  }
  
}

const uniswapLogic = async (values,mainIndex,exchangeIndex,resolve,reject) => {
let pariAddr = values.pairtoken.toString()
  try {    
    let result = await axios.post(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        query: `
        {
          pair(id:"${pariAddr}"){
            id
            token0Price
            token1Price
          }
        }
      `,
      }
    );
    table[mainIndex].exchanges[exchangeIndex].price0 = result.data.data.pair.token0Price
    table[mainIndex].exchanges[exchangeIndex].price1 = result.data.data.pair.token1Price
    resolve(0)
  } catch (error) {
    console.error(error);
    resolve(0)
  }
}


const sushiswapLogic = async (values,mainIndex,exchangeIndex,resolve,reject) => {
  sushiApi.getPair(1,values.pairtoken).then(function(res) {
    res.forEach( function(pair) {
      table[mainIndex].exchanges[exchangeIndex].price0 = pair.Token_1_price;
      table[mainIndex].exchanges[exchangeIndex].price1 = pair.Token_2_price;
      resolve(0)
      }
    );
  });
}


router.get('/getPrice',buildArray,async (req,res,next) => {
  // await buildArray()
  await addSushiSwap(req,res)
  

});

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.use('/', router);
app.listen(process.env.port || 3000);