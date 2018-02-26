
var Web3 = require('web3');
var fs = require('fs');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var json = JSON.parse(fs.readFileSync("MetaCoin.json"));//合约编译后的json文件
var abi = json.abi;
var metacoin = web3.eth.contract(abi).at("0x77a0fc347a5040a2e82982b9572cb42b2269a326");

var txhash = metacoin.sendCoin.sendTransaction("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", 100, {from:web3.eth.accounts[0]});
console.log(txhash);

var account_one_balance = metacoin.getBalance.call("0xb3606590468d28dd511b7fa22d512a369a8fc2dd");
console.log("account one balance: ", account_one_balance.toNumber());



























