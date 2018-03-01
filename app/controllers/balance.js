//加载编译的模型
var Atm = require('../models/atm');
var Card = require('../models/card');
var NodeContract = require('../models/nodeContract');//传入与合约交互部分
var async = require('async');
//balance列表页
exports.balancelist = function (req, res) {
    var tempCustomerArr = [];
    var totalBlockBalance = 0;//所有区块链账户余额

    //获取所有的客人的现金账户余额和区块链账户余额
    const p1 = new Promise((resolve, reject) => {
        Card.fetch(function (err, cards) {
            if (err) {
                console.log(err);
            }
            //关联查询，返回查询的数组，再渲染页面
            async.each(cards, (card, callback) => {
                var temp = {
                    name: card.name,
                    blockBalance: NodeContract.getBalance(card.blockAccount, card.blockPassword)
                };
                totalBlockBalance += temp.blockBalance;
                tempCustomerArr.push(temp);
                callback(null);

            }, err => {
                console.log(err);
                resolve();
            })
        })
    })
    //获取所有的atm的现金账户余额和区块链账户余额
    const p2 = new Promise((resolve, reject) => {
        Atm.fetch(function (err, atms) {
            if (err) {
                console.log(err);
            }
            //关联查询，返回查询的数组，再渲染页面
            async.each(atms, (atm, callback) => {
                var temp = {
                    name: atm.atmId,
                    blockBalance: NodeContract.getBalance(atm.blockAccount, atm.blockPassword)
                };
                totalBlockBalance += temp.blockBalance;
                tempCustomerArr.push(temp);
                callback(null);

            }, err => {
                console.log(err);
                resolve();
            })
        })
    })
    const p = Promise.all([p1, p2]).then(() => {
        res.render('balancelist', {
            pageTitle: "实时余额分布页",
            customers: tempCustomerArr,
            totalBlockBalance: totalBlockBalance
        });
    })
}
