var Web3 = require('web3');
// var contract = require("truffle-contract");
var fs = require('fs');
// 连接到以太坊节点
// var account_one = "0x2a94366521f3b3bce62d4b8dabcfc5afc253cdd3"; // an address
// var account_two = "0x3f7542967dd790a7c54eb225f8deda7a05397562"; // another address

// web3.personal.unlockAccount(web3.eth.accounts[0], '', 0);
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));
function test(){
    var metacoin;
    //要与合约交互，需要获取部署后的合约ABI以及地址
    fs.readFile("MetaCoin.json",'utf8',(err,data)=>{
        var json=JSON.parse(data);
        var abi=json.abi;//合约ABI
        var address=json.networks.address;//合约地址
        metacoin = web3.eth.contract(abi).at(address);//通过ABI和地址获取已部署的合约对象
        var account_one = web3.eth.accounts[0];
        var account_one_balance = metacoin.getBalance.call(account_one);
        console.log("account one balance: ", account_one_balance.toNumber()); 
    })
}
test();

// MetaCoin.deployed().then(function(instance) {
//   meta = instance;
//   console.log("sendCoin");
//   return meta.sendCoin(account_two, 10, {from: account_one});
// }).then(function(result) {
//   console.log("Transaction successful!")
// }).catch(function(e) {
// })