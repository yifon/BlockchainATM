var Web3 = require('web3');
var fs = require('fs');
var path = require('path');

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));//私有网络
var contractFile = path.join(__dirname, '../../', '/build/contracts/BTM.json')//合约地址
var json = JSON.parse(fs.readFileSync(contractFile));//合约编译后的json文件
var abi = json.abi;//调用ABI
var contract = web3.eth.contract(abi).at("0x7f4f9e96ecbc92725952871d234fa157f81b471f");//传入合约地址，返回合约对象

//查询余额
exports.queryBalance = (fromBlockAccount, fromBlockAccountPwd)=> {
  console.log(web3.eth.accounts)
  // web3.personal.unlockAccount("0x6c4449e1e9476ac52f149cc9710544e75616cd37", "123456", 0);//传入区块链账户，密码
  contract.setBalance("0x6c4449e1e9476ac52f149cc9710544e75616cd37",5000,{ from: web3.eth.accounts[0], gas: 0x47b760 });
  var balance = contract.getBalance("0x6c4449e1e9476ac52f149cc9710544e75616cd37");
  return balance.toNumber();//返回余额
}


