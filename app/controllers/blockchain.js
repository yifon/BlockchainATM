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
exports.setBalance = (req, res,next) => {
    var blockAccount = req.body.card.blockAccount;
    var blockPassword = req.body.card.blockPassword;
    var blockAccountBalance = req.body.card.blockAccountBalance;
    NodeContract.setBalance(blockAccount, blockPassword, blockAccountBalance);
    var bal = NodeContract.getBalance(blockAccount, blockPassword);
    console.log(bal)
    next();
}