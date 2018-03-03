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
    var type = req.session.transaction["type"];//交易类型
    var debitAcc = req.session.transaction["debitAccount"];//扣款账户名
    var debitBlockAcc = req.session.transaction["fromBlockAccount"];//扣款账户
    var debitBlockAccPwd = req.session.transaction["fromBlockAccountPwd"];//扣款账户密码
    var creditAcc = req.session.transaction["creditAccount"];//收款账户名
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
            const result = await NodeContract.startTransfer(type, debitAcc, debitBlockAcc, creditAcc, creditBlockAcc, amount);
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

//获取区块链交易记录
exports.transaction = (req, res) => {
    // 假设查询开始的区块号为10，后期设置搜索框
    // var startBlock = req.query.startBlock;

    var startBlock = 1470;
    const trxRecords = NodeContract.transactions(startBlock);
    var transactions = [];
    for (var i = 0; i < trxRecords.length; i++) {
        var aRec = {
            blockNo: trxRecords[i].blockNumber,
            time: trxRecords[i].timeStamp,
            type: trxRecords[i].log.events[0].value,
            // customer: trxRecords[i].log.events[1].value,
            debitAccount: trxRecords[i].log.events[1].value,
            fromAccount: trxRecords[i].log.events[2].value,
            creditAccount: trxRecords[i].log.events[3].value,
            toAccount: trxRecords[i].log.events[4].value,
            amount: trxRecords[i].log.events[5].value,
            status: trxRecords[i].log.events[6].value ? "成功" : "失败"
        };
        transactions.push(aRec);
    }
    console.log(transactions)
    //渲染页面
    res.render('transactionlist', {
        pageTitle: "交易信息列表页",
        transactions: transactions
    })
}
