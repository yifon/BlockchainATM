
var Web3 = require('web3');
var fs = require('fs');

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));//A001节点
var json = JSON.parse(fs.readFileSync("Coin.json"));//合约编译后的json文件
var abi = json.abi;//调用ABI
var contract = web3.eth.contract(abi).at("0x6392ceeba27b35f7259e1cfd4fa928cc0878a9d3");//传入合约地址，返回合约对象
// var event=contract.informBalance();
// event.watch((err,res)=>{
//   console.log("=====")
//   console.log(res.args)
//   console.log(res.args.result)
//   console.log(res.args[0])

// })

// web3.personal.unlockAccount(web3.eth.accounts[0], '123456', 0);
// web3.eth.defaultAccount = web3.eth.coinbase;

// function getBalance(blockAccount, password) {
//   // web3.personal.unlockAccount(blockAccount, password, 0);//传入小A账户，密码
//   //调用合约的getBalance函数查看账户余额
//   var balance = contract.getBalance(blockAccount);
//   console.log(blockAccount + " 账户余额:" + balance);
// }
// function setBalance(blockAccount, password, amount) {
//   web3.personal.unlockAccount(blockAccount, password, 0);//传入小A账户，密码
//   // console.log(web3.eth.getGasPrice());
//   //调用合约的setBalance函数添加账户余额
//   var hash = contract.setBalance(blockAccount, amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
//   console.log(hash)
// }

// getBalance("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", "a12345678");//查看小A账户余额
// getBalance("0xffeffcb62122b5b27b3b33afcd8af2d9c7f9c51c", "b001");//查看B001账户余额
// setBalance("0xffeffcb62122b5b27b3b33afcd8af2d9c7f9c51c", "b001", 5000);//设置小A账户余额为5000


function mint(blockAccount, password,amount) {
  // web3.personal.unlockAccount(blockAccount, password, 0);//传入小A账户，密码
 contract.mint(blockAccount,amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
}
function queryBalance(blockAccount, password) {
  // web3.personal.unlockAccount(blockAccount, password, 0);//传入小A账户，密码
  // console.log(web3.eth.getGasPrice());
  //调用合约的setBalance函数添加账户余额
  var balance = contract.queryBalance(blockAccount);
  console.log(balance.toNumber())
}
mint("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", "a12345678", 500);//设置小A账户余额为5000
queryBalance("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", "a12345678");//查看小A账户余额

























