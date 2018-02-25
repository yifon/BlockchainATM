
var Transaction = require('../models/transaction');
//transaction列表页
exports.transactionlist = function (req, res) {
    Transaction.fetch(function (err, transactions) {
        if (err) {
            console.log(err);
        }
        res.render('transactionlist', {
            pageTitle: "交易信息列表页",
            transactions: transactions
        })
    })
}
