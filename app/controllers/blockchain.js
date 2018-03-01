//引入await/async
require('babel-core/register');

var NodeContract = require('../models/nodeContract');//传入与合约交互部分
//查找账户
exports.findAccount = (req, res) => {
    var blockAccount = req.body.blockAccount;
    //查询账户是一个异步的过程，要得到查询结构后才可以返回结果
    async function findAccount() {
        try {
            const result = await NodeContract.findAccount(blockAccount);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    findAccount().then(result => {
        var data = {
            success: result
        };
        res.json(data);
    })
}
//设置余额
exports.setBalance = (req, res, next) => {
    var blockAccount;
    var blockPassword;
    var blockAccountBalance;
    if (req.body.card) {
        blockAccount = req.body.card.blockAccount;
        blockPassword = req.body.card.blockPassword;
        blockAccountBalance = req.body.card.blockAccountBalance;
    } else if (req.body.atm) {
        blockAccount = req.body.atm.blockAccount;
        blockPassword = req.body.atm.blockPassword;
        blockAccountBalance = req.body.atm.blockAccountBalance;
    }
    NodeContract.setBalance(blockAccount, blockPassword, blockAccountBalance);
    next();
}

//取款／存款／转帐
exports.confirmAmt = (req, res) => {
    var amount = req.body.amount;//数额
    req.session.transaction["amount"] = amount;
    var debitBlockAcc = req.session.transaction["fromBlockAccount"];//扣款账户
    var debitBlockAccPwd = req.session.transaction["fromBlockAccountPwd"];//扣款账户密码
    var creditBlockAcc = req.session.transaction["toBlockAccount"];//收款账户
    var data;
    //查看扣款账户是否有足够的钱
    // var bal = NodeContract.getBalance(debitBlockAcc, debitBlockAccPwd);
    // if (bal < amount) {
    //     console.log(bal)
    //     data = {
    //         "success": false,
    //         "msg": "账户余额不足"
    //     }
    //     res.json(data);
    // } else {
    //转帐是一个异步的过程，要结束转帐后才可以返回结果
    async function getTransferResult() {
        try {
            const result = await NodeContract.startTransfer(debitBlockAcc, creditBlockAcc, amount);
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
    // }
}
