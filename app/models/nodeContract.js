var Web3 = require('web3');
var fs = require('fs');
var path = require('path');
var async = require('async');
var web3Admin = require('web3admin');

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7101"));//私有网络
web3Admin.extend(web3);
var contractFile = path.join(__dirname, '../../', '/build/contracts/BTM.json')//合约地址
var json = JSON.parse(fs.readFileSync(contractFile));//合约编译后的json文件
var abi = json.abi;//调用ABI
var contract = web3.eth.contract(abi).at("0x04c5a48bb7be77dd9f2bcf8e9cc1c9f9731d1fdf");//传入合约地址，返回合约对象
web3.personal.unlockAccount(web3.eth.accounts[0], "123456", 0);//传入区块链账户，密码
//注册账户
exports.registerAccount = (account) => {

}

//取消账户
exports.unRegisterAccount = (account) => {

}

//查询账户是否存在
exports.findAccount = (account) => {
  var accounts = web3.eth.accounts;
  for (var i = 0; i < accounts.length; i++) {
    if (account == accounts[i]) {
      return true;
    }
  }
  return false;
  //异步的调用暂时处理有点问题
  //返回当前节点持有的账户列表 [Array]
  // web3.eth.getAccounts((err, accounts) => {
  //   console.log(accounts);
  //   accounts.forEach(acc => {
  //     if (acc == account) {
  //       console.log("true")
  //       return true;
  //     }
  //   }, err => {
  //     return false;
  //   })
  // })
}

//设置余额 [传入区块链账户，密码,设置数额]
exports.setBalance = (fromBlockAccount, fromBlockAccountPwd, amount) => {
  console.log("from:" + fromBlockAccount)
  console.log("pwd:" + fromBlockAccountPwd)
  console.log("amount:" + amount);

  var hash = contract.setBalance(fromBlockAccount, amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
  console.log("turning on mining", web3.miner.start());
  console.log("isMining?", web3.eth.mining);
  console.log(hash);
  var balance = contract.getBalance(fromBlockAccount);
  console.log("balance:" + balance);
}

//查询余额 [传入区块链账户，密码]
exports.getBalance = (fromBlockAccount, fromBlockAccountPwd) => {
  console.log("from:" + fromBlockAccount)
  var balance = contract.getBalance(fromBlockAccount);
  console.log("balance:" + balance);
  return balance.toNumber();//返回余额
}

//账户资产转移
exports.startTransfer = (fromBlockAccount, toBlockAccount, amount) => {
  console.log("from:" + fromBlockAccount)
  console.log("to:" + toBlockAccount)
  console.log("amount:" + amount);
  var balance0 = contract.getBalance(fromBlockAccount);
  console.log("before: from acc balance:" + balance0);
  var balance1 = contract.getBalance(toBlockAccount);
  console.log("before: to acc balance:" + balance1);
  var hash = contract.startTransfer(fromBlockAccount, toBlockAccount, amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
  console.log("turning on mining", web3.miner.start());
  console.log("isMining?", web3.eth.mining);
  console.log(hash);
  //接收来自Blockchain结束交易的通知
  return new Promise((resolve, reject) => {
    contract.finishTransfer().watch((err, res) => {
      if (err) {
        console.log(err)
      }
      var result = res.args.result;
      console.log("获得交易结果：" + result);
      resolve(result);
    })
  })
}
