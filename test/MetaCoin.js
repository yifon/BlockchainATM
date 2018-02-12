var Web3 = require('web3');
var path = require('path');
var fs = require('fs');
// 连接到以太坊节点
// var account_one = "0x2a94366521f3b3bce62d4b8dabcfc5afc253cdd3"; // an address
// var account_two = "0x3f7542967dd790a7c54eb225f8deda7a05397562"; // another address

// web3.personal.unlockAccount(web3.eth.accounts[0], '', 0);
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
function test() {
    var metacoin;
    var contractPath = path.join(__dirname, '../', '/build/contracts/MetaCoin.json')//生成服务器的存储地址
    //要与合约交互，需要获取部署后的合约ABI以及地址
    const p=new Promise((resolve,reject)=>{
        fs.readFile(contractPath, 'utf8', (err, data) => {
            var json = JSON.parse(data);
            resolve(json);
        })
    }).then(json=>{
        var abi = json.abi;//合约ABI
        var address = "0xde87b14f60c4e51a76f09d16bcdb579097337d7f";//合约地址
        metacoin = web3.eth.contract(abi).at(address);//通过ABI和地址获取已部署的合约对象
        var account_one = web3.eth.accounts[0];
        var account_two = web3.eth.accounts[1];
        console.log("account_one:"+account_one)
        var account_one_balance = metacoin.getBalance.call(account_one);
        console.log("account one balance: ", account_one_balance.toNumber());
        var trxHash=metacoin.sendCoin.sendTransaction(account_two,100,{from:account_one});
        console.log(trxHash)

        var myEvent=metacoin.Transfer();
        myEvent.watch((err,result)=>{
            if(!err){
                console.log(result);
            }else{
                console.log(err);
            }
            console.log("account one balance: ", metacoin.getBalance.call(account_one).toNumber());
            console.log("account two balance: ", metacoin.getBalance.call(account_two).toNumber());
            myEvent.stopWatching();
        })
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