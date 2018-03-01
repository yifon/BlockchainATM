//引入await/async
require('babel-core/register');
// require('./async.js');

var NodeContract = require('../models/nodeContract');//传入与合约交互部分
//查找账户
exports.findAccount = (req, res) => {
    var blockAccount = req.body.blockAccount;
    var data = {
        success: NodeContract.findAccount(blockAccount)
    };
    res.json(data);
}
//设置余额
exports.setBalance = (req, res, next) => {
    var blockAccount = req.body.card.blockAccount;
    var blockPassword = req.body.card.blockPassword;
    var blockAccountBalance = req.body.card.blockAccountBalance;
    NodeContract.setBalance(blockAccount, blockPassword, blockAccountBalance);
    next();
}

//取款
exports.confirmCwd = (req, res) => {
    var debitAmt = req.body.amount;//取款数额
    req.session.transaction["amount"] = debitAmt;
    var debitBlockAcc = req.session.transaction["fromBlockAccount"];
    var debitBlockAccPwd = req.session.transaction["fromBlockAccountPwd"];
    console.log("debitBlockAcc:" + debitBlockAcc)
    var creditBlockAcc = req.session.atm["blockAccount"];
    var data;
    //查看扣款账户是否有足够的钱
    var bal = NodeContract.getBalance(debitBlockAcc, debitBlockAccPwd);
    if (bal < debitAmt) {
        console.log(bal)
        data = {
            "success": false,
            "msg": "账户余额不足"
        }
        res.json(data);
    } else {
        //转帐是一个异步的过程，要结束转帐后才可以返回结果
        async function getTransferResult() {
            try {
                const result = await NodeContract.startTransfer(debitBlockAcc, creditBlockAcc, debitAmt);
                console.log("result:" + result);
                return result;
            } catch (err) {
                console.log(err);
            }
        }
        getTransferResult().then(result => {
            data = {
                "success": result,
                "msg": "/result"
            }
            console.log("2,result:" + result);
            req.session.transaction["status"] = result;
            res.json(data);
        })
    }
}