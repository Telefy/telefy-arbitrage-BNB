// step 1: get Pool Price token a and token b
// step 2: contant_product = xioPool * ethpool
// step 3: newXiopool = (XioEnterAmount + xioPool)
// step 4: ETHBALANC = contant_product / newXiopool 
// step 5: ReceivedEth = ethpool - ETHBALANC
// step 6: XioPerEth = XioEnterAmount/ReceivedEth
// step 7 : marketPrice = xioPool/ethpool
// step 8: priceimpact = ((marketPrice-XioPerEth)/marketPrice)*100


// const [token_A, token_b] = [12359037.173804648463360192,517072.27411072449743893];
// step 1:
// const [token_A, token_b] = [11202163.618734760275607175,586.777034458388820076];
const [token_A, token_b] = [11735360.320324412882542843,413.530364285482987464];
// step 2:
const input_value = 1000000;
// const input_value = ((input_value_bf/100)*0.3) + input_value_bf;
// step 3:
const contant_product = token_A * token_b
// step 4:
const new_token_A = (input_value + token_A);
// step 5:
const ethbalance = contant_product / new_token_A;
// step 6:
const receivedEth = token_b - ethbalance;
// step 7 

// const dy = token_b * 0.997 * input_value / (token_A + 0.997 * input_value);

const tokenAPerTokenB = input_value/receivedEth;
// step 8:
const marketPrice = token_A/token_b;
const priceimpact = ((marketPrice-tokenAPerTokenB)/marketPrice)*100;
console.log("Price Impact: ",priceimpact)




// console.log(dy,"---dy---")

// let a = 0.3/100 * input_value;
