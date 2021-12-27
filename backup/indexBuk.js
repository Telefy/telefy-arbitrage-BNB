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
});

let table = []
let allPromise = []

const buildArray = async (res,req,next) => {
  table = []
   await con.query(`SELECT * FROM m_common_pair where exchange_type = 'UNISWAP' limit 40`, function (err, result) {
    if (err) throw err;
    let i=0
    result.forEach(element => {
          
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
        let UniswapObj = {
          name: "uniswap",
          pairtoken: element.pairtoken,
          price0:'',
          price1:''
        }
        allPromise.push(new Promise((resolve,reject) => uniswapLogic(UniswapObj,i,0,resolve,reject)))
        i++
    });
    if(result.length == table.length){      
      next()
    }
});

}


const addSushiSwap = async (req,res) => {
  // console.log(table,"====")
    con.query(`SELECT * FROM m_common_pair where exchange_type = 'SUSHISWAP' limit 40`, function (err, result) {
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
      let sushiObj = {
        name: "sushiswap",
        pairtoken: element.pairtoken,
        price0:'',
        price1:''
      }
      allPromise.push(new Promise((resolve,reject) => sushiswapLogic(sushiObj,getIndex,1,resolve,reject)))
            i++
    });
    if(result.length == i){      
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
    
});
}




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
    console.error(error,values);
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