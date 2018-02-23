
/**
 * getInfo.js:用来获取节点网络状态，余额
 */
var fs = require('fs');
var cors = require('cors');
var banksInfoPath = path.join(__dirname, '../', '/build/contracts/banks.json')//银行信息
var contractInitVars = { contractfile: "/root/nodes/BTM.json", web3http: "http://localhost:7101", contractAdd: "0x8182dd293942ff6839e6e8c8a71981bb8ad655e5" };

var Web3 = require('web3');

var web3 = new Web3(new Web3.providers.HttpProvider(contractInitVars.web3http));//pls note the port to be deployed, one port = one instance, different nodes may have different behaviors   
web3.personal.unlockAccount(web3.eth.accounts[0], '', 0);

var json = JSON.parse(fs.readFileSync(contractInitVars.contractfile));
var abi = json.abi;
var contract = web3.eth.contract(abi).at(contractInitVars.contractAdd);



var express = require('express');
var app = express();
app.use(cors());
var http = require('http');
var banksInfo = JSON.parse(fs.readFileSync(banksInfoPath));






//return a new json with the following structure
/*[
{'name':'abc', 'address'："0x", 'balance': 10000,
	'atms': [
		{'name':'A001', 'address'："0x", 'balance': 100},
		{'name':'A002', 'address'："0x", 'balance': 100},...
	]
},...
]

*/
app.get('/balances', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");


    console.log("get balances：" + contract.getBalance("0xca843569e3427144cead5e4d5999a3d0ccf92b8e"));
    for (var i = 0; i < banksInfo.accounts.length; i++) {
        banksInfo.accounts[i].balance = contract.getBalance(banksInfo.accounts[i].address);
        console.log(banksInfo.accounts[i].address + ":" + banksInfo.accounts[i].balance);
        console.log(banksInfo.accounts[i].atms.length);
        for (var j = 0; j < banksInfo.accounts[i].atms.length; j++) {

            banksInfo.accounts[i].atms[j].balance = contract.getBalance(banksInfo.accounts[i].atms[j].address);
            console.log(banksInfo.accounts[i].atms[j].address + "：" + banksInfo.accounts[i].atms[j].balance);
        }

    }

    res.json(banksInfo);


});//return balance of an account



app.get('/updateBalance', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var headers = req.headers;
    var account = headers.account;


    var balance = headers.balance;
    console.log("update bal:" + account + ":" + balance);
    contract.changeBalance(account, parseInt(balance), { from: web3.eth.accounts[0], gas: 0x47b760 });
    res.sendStatus(200);
    res.end();


});//return balance of an account




var checkConnection = function (bankI, atmJ, initCallback) {
    console.log("checking:" + banksInfo.accounts[bankI].atms[atmJ].ip + ":" + banksInfo.accounts[bankI].atms[atmJ].port);
    http.get({
        hostname: banksInfo.accounts[bankI].atms[atmJ].ip,
        port: 6102,
        path: '/network',
        headers: {
            'port': banksInfo.accounts[bankI].atms[atmJ].port
        }
    }, (res) => {
        var result = '';
        res.on('data', function (chunk) {
            result += chunk;
        });
        res.on('end', function () {
            //completed request
            var jsonRes = JSON.parse(result);
            console.log(bankI + ":" + atmJ);
            banksInfo.accounts[bankI].atms[atmJ].isConnected = jsonRes.isConnected;

            initCallback();

        });
    }


    );
}
app.use(express.static('static'));

app.listen(6101, () => console.log("started server"));


