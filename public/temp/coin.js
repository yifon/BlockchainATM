
var Web3 = require('web3');
var fs = require('fs');

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
var json = JSON.parse(fs.readFileSync("Coin.json"));//合约编译后的json文件
var abi = json.abi;
var contract = web3.eth.contract(abi).at("0x03eaf264d8d8b1d2e450745393136b10029c5bcc");

function mint(blockAccount, password,amount) {
  web3.personal.unlockAccount(blockAccount, password, 0);
 contract.mint(blockAccount,amount, { from: web3.eth.accounts[0], gas: 0x47b760 });
}
function queryBalance(blockAccount, password) {
  web3.personal.unlockAccount(blockAccount, password, 0);
  var balance = contract.queryBalance(blockAccount);
  console.log(balance.toNumber())
}
mint("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", "a12345678", 500);//设置余额为5000
queryBalance("0xb3606590468d28dd511b7fa22d512a369a8fc2dd", "a12345678");//查看账户余额

























