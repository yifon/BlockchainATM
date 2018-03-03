var Web3 = require('web3');
var fs = require('fs');
var path = require('path');
var async = require('async');
var web3Admin = require('web3admin');
var abiDec = require('abi-decoder');

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7101"));//私有网络
web3Admin.extend(web3);
var contractFile = path.join(__dirname, '../../', '/build/contracts/BTM.json')//合约地址
var json = JSON.parse(fs.readFileSync(contractFile));//合约编译后的json文件
var abi = json.abi;//调用ABI
abiDec.addABI(abi);
var contractAddress = "0xed1be9aa51db857129a1d17c5f9c079fc9582e4e";
var contract = web3.eth.contract(abi).at(contractAddress);//传入合约地址，返回合约对象
web3.personal.unlockAccount(web3.eth.accounts[0], "", 0);//传入区块链账户，密码
//注册账户
exports.registerAccount = (account) => {

}

//取消账户
exports.unRegisterAccount = (account) => {

}

//查询账户是否存在
exports.findAccount = (account) => {
  // var accounts = web3.eth.accounts;
  // for (var i = 0; i < accounts.length; i++) {
  //   if (account == accounts[i]) {
  //     return true;
  //   }
  // }
  // return false;

  //返回当前节点持有的账户列表 [Array]
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      console.log(accounts);
      accounts.forEach(acc => {
        if (acc == account) {
          console.log("true")
          resolve(true);
        }
      }, err => {
        resolve(false);
      })
    })
  })
}

//设置余额 [传入区块链账户，密码,设置数额]
exports.setBalance = (fromBlockAccount, fromBlockAccountPwd, amount) => {
  console.log("from:" + fromBlockAccount)
  console.log("pwd:" + fromBlockAccountPwd)
  console.log("amount:" + amount);
  var oldBlockNumber = web3.eth.blockNumber;
  console.log("oldBlockNumber:" + oldBlockNumber)
  var hash = contract.setBalance(fromBlockAccount, amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
  console.log("turning on mining", web3.miner.start());
  if (web3.eth.blockNumber - oldBlockNumber == 1) {
    web.miner.stop()
    console.log("stop")
  }
  console.log("newBlockNumber:" + web3.eth.blockNumber)
  console.log("isMining?", web3.eth.mining);
  console.log(hash);
}

//查询余额 [传入区块链账户，密码]
exports.getBalance = (fromBlockAccount, fromBlockAccountPwd) => {
  var balance = contract.getBalance(fromBlockAccount);
  console.log("balance:" + balance);
  return balance.toNumber();//返回余额
}

//账户资产转移
exports.startTransfer = (type, debitAcc, debitBlockAcc, creditAcc, creditBlockAcc, amount) => {
  console.log("type:" + type)
  console.log("debitAcc:" + debitAcc)
  console.log("from:" + debitBlockAcc)
  console.log("creditAcc:" + creditAcc)
  console.log("to:" + creditBlockAcc)
  console.log("amount:" + amount);
  var balance0 = contract.getBalance(debitBlockAcc);
  console.log("before: from acc balance:" + balance0);
  var balance1 = contract.getBalance(creditBlockAcc);
  console.log("before: to acc balance:" + balance1);
  var oldBlockNumber = web3.eth.blockNumber;
  console.log("oldBlockNumber:" + oldBlockNumber)
  var hash = contract.startTransfer(type, debitAcc, debitBlockAcc, creditAcc, creditBlockAcc, amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
  console.log("turning on mining", web3.miner.start());

  console.log("newBlockNumber:" + web3.eth.blockNumber)
  console.log("isMining?", web3.eth.mining);
  console.log(hash);
  return this.finishTransfer();
}

//接收来自Blockchain结束交易的通知
exports.finishTransfer = () => {
  return new Promise((resolve, reject) => {
    contract.finishTransfer().watch((err, res) => {
      console.log("newBlockNumber:" + web3.eth.blockNumber)
      if (err) {
        console.log(err)
      }
      var result = res.args.status;
      console.log("获得交易结果：" + result);
      resolve(result);
    })
  })
}

//
exports.transactions = (startBlock) => {
  console.log("blockNumber:" + web3.eth.blockNumber)
  var trxRecords = [];
  for (var i = web3.eth.blockNumber - 10; i < web3.eth.blockNumber; i++) {
    var block = web3.eth.getBlock(i);
    var trxs = block.transactions;
    for (var trxI = 0; trxI < trxs.length; trxI++) {
      var receipt = web3.eth.getTransactionReceipt(trxs[trxI]);
      var logs = abiDec.decodeLogs(receipt.logs);
      try {
        if (logs[0] != undefined && logs[0].name == "finishTransfer" && logs[0].address == contractAddress) {//finishTransfer事件, 且是从BTM合约发起的
          var aRecord = { blockNumber: i, timeStamp: block.timestamp, log: logs[0] };
          trxRecords.push(aRecord);
          console.log(trxRecords)
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  return trxRecords;
}
