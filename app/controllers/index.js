var Card = require('../models/card');
var Atm = require('../models/atm');
var NodeContract = require('../models/nodeContract');//传入与合约交互部分
var async = require('async');
//首页，开始交易
exports.welcome = function (req, res) {
    delete req.session.transaction;//清除transaction的session数据
    delete req.session.atm;//清除atm的session数据
    req.session.transaction = {
        type: "",
        debitAccount: "",
        creditAccount: "",
        fromBlockAccount: "",
        fromBlockAccountPwd: "",
        toBlockAccount: "",
        toBlockAccountPwd: "",
        amount: "",
        status: ""
    };
    req.session.atm = {
        _id: "",
        atmId: "",
        blockAccount: "",
        blockPassword: ""
    }
    res.render('welcome', {
        bigTitle: "欢迎使用区块链ATM系统!"
    });
}
//输入卡号页
exports.enterAcc = function (req, res) {
    res.render('enterAcc', {
        bigTitle: "请输入您的卡号和密码："
    });
}
//验证客人输入的卡号，验证成功则跳转输入密码页
exports.submitAcc = function (req, res) {
    var data;
    var _customer = req.body.customer;
    //查找卡号是否支持
    const p = new Promise((resolve, reject) => {
        Card.findByNumber(_customer.debitAccount, (err, card) => {
            if (card) {
                if (_customer.password != card.password) {
                    data = {
                        "success": false,
                        "msg": "密码错误！"
                    }
                } else {
                    req.session.transaction["debitAccount"] = _customer.debitAccount;//将卡号存储在session中
                    data = {
                        "success": true,
                        "msg": "/chooseAtm"
                    };
                }
                resolve(data);
            } else {
                data = {
                    "success": false,
                    "msg": "不存在此卡号！"
                }
                resolve(data);
            }
        })
    }).then(data => {
        res.send(data);//先直接跳转，等待后边集成blockchain后做密码判断
    })
}

//选择ATM页
exports.chooseAtm = function (req, res) {
    var _transaction = req.session.transaction;
    console.log("debitAccount:" + req.session.transaction["debitAccount"]);
    if (typeof _transaction == "undefined" || !_transaction.hasOwnProperty("debitAccount") || _transaction.debitAccount == "") {
        return res.redirect("/");//若未输入过卡号，则因跳转到首页
    }
    var tempAtmArr = [];
    Atm.fetch(function (err, atms) {
        if (err) {
            console.log(err);
        }
        //关联查询，返回查询的数组，再渲染页面
        async.each(atms, (atm, callback) => {
            Atm.findOne({ _id: atm._id })
                .populate({ path: 'bank', select: 'name' })
                .exec((err, atm) => {
                    tempAtmArr.push(atm);
                    callback(null);
                })
        }, err => {
            console.log(err);
            res.render('chooseAtm', {
                bigTitle: "请选择服务的ATM",
                atms: tempAtmArr,
            })
        })
    })
}
//确认选择的ATM后，跳转到选择交易页
exports.confirmAtm = (req, res) => {
    var data = {
        "success": true,
        "msg": "/chooseTxn?supportedTxns=" + req.body.supportedTxns
    }
    res.json(data);
}
//跳转到选择交易页
exports.chooseTxn = (req, res) => {
    var supportedTxns = String(req.query.supportedTxns).split(",");
    console.log(supportedTxns);
    res.render('chooseTxn', {
        bigTitle: "请选择交易类型",
        supportedTxns: supportedTxns,
    })
}
/**
 * 确认选择的交易类型
 * 查询余额：跳转到结果页面
 * 取款／存款：跳转到输入取款／存款数额页面
 * 转账：跳转到输入收款银行卡页面
 */
exports.confirmTxn = (req, res) => {
    var type = req.body.type;
    console.log(type);
    req.session.transaction["type"] = type;
    switch (type) {
        case '查询余额':
            data = {
                "success": true,
                "msg": "/result"
            };
            res.json(data);
            break;
        case '取款':
            const p1 = new Promise((resolve, reject) => {
                Card.findByNumber(req.session.transaction["debitAccount"], (err, card) => {
                    console.log("card:" + card);
                    req.session.transaction["fromBlockAccount"] = card.blockAccount;
                    req.session.transaction["fromBlockAccountPwd"] = card.blockPassword;
                    resolve();
                });
            }).then(() => {
                req.session.transaction["creditAccount"] = req.session.atm["atmId"];
                var blockAccount = req.session.atm["blockAccount"];
                var blockPassword = req.session.atm["blockPassword"];
                console.log("blockAccount:" + blockAccount)
                req.session.transaction["toBlockAccount"] = blockAccount;
                req.session.transaction["toBlockAccountPwd"] = blockPassword;
                data = {
                    "success": true,
                    "msg": "/enterValue"
                };
                console.log(req.session.transaction);
                res.json(data);
            });
            break;
        case '存款':
            const p2 = new Promise((resolve, reject) => {
                Card.findByNumber(req.session.transaction["debitAccount"], (err, card) => {
                    console.log("card:" + card);
                    req.session.transaction["toBlockAccount"] = card.blockAccount;
                    req.session.transaction["toBlockAccountPwd"] = card.blockPassword;
                    resolve();
                });
                req.session.transaction["creditAccount"] = req.session.transaction["debitAccount"];//对于存款来说，收款账户是客人账户
                req.session.transaction["debitAccount"] = req.session.atm["atmId"];//对于存款来说，扣款账户是atm区块链账户
                req.session.transaction["fromBlockAccount"] = req.session.atm["blockAccount"];
                req.session.transaction["fromBlockAccountPwd"] = req.session.atm["blockPassword"];
            }).then(() => {
                data = {
                    "success": true,
                    "msg": "/enterValue"
                };
                console.log(req.session.transaction);
                res.json(data);
            });
            break;
        case '转账':
            const p3 = new Promise((resolve, reject) => {
                Card.findByNumber(req.session.transaction["debitAccount"], (err, card) => {
                    console.log("card:" + card);
                    req.session.transaction["fromBlockAccount"] = card.blockAccount;
                    req.session.transaction["fromBlockAccountPwd"] = card.blockPassword;
                    resolve();
                });
            }).then(() => {
                data = {
                    "success": true,
                    "msg": "/enterValue"
                };
                console.log(req.session.transaction);
                res.json(data);
            });
            break;
        default:
            data = {
                "success": false,
                "msg": "服务器异常"
            }
            res.json(data);
            break;
    }
}

/**
 * 输入数额页面;输入收款银行卡页面
 */
exports.enterValue = (req, res) => {
    var type = req.session.transaction["type"];
    //输入账户
    if (type) {
        res.render('enterAcc', {
            bigTitle: "请输入您的" + type + "数额：",
            type: type
        })
    }
}

/**
 * 判断是否是转帐，是的话要设置对应的收款账户
 */
exports.isTransfer = (req, res, next) => {
    var type = req.body.type;//获取交易类型
    if (type == "转账") {
        var creditAccount = req.body.creditAccount;
        req.session.transaction["creditAccount"] = creditAccount;
        //查询对应的区块链账户，密码
        Card.findByNumber(creditAccount, (err, card) => {
            console.log(card)
            req.session.transaction["toBlockAccount"] = card.blockAccount;
            req.session.transaction["toBlockAccountPwd"] = card.blockPassword;
            next();
        });
    } else {
        next();
    }
}

/**
 * 结果页面：
 * 查询余额：跳转到结果页面
 * 取款／存款：输入取款／存款数额后跳转到结果页面
 * 转账：输入收款银行卡后跳转到结果页面
 */
exports.result = (req, res) => {
    var type = req.session.transaction["type"];
    var debitAccount = req.session.transaction["debitAccount"];
    var creditAccount = req.session.transaction["creditAccount"];
    var balance = 0;
    var status = false;
    if (type == "取款" || type == "存款" || type == "转账") {
        var amount = req.session.transaction["amount"];
        status = req.session.transaction["status"];
        if (type == "取款" || type == "转账") {
            balance = NodeContract.getBalance(req.session.transaction["fromBlockAccount"], req.session.transaction["fromBlockAccountPwd"]);
        }
        if (type == "存款") {
            balance = NodeContract.getBalance(req.session.transaction["toBlockAccount"], req.session.transaction["toBlockAccountPwd"]);
        }
        res.render('result', {
            bigTitle: type + "结果：",
            type: type,
            debitAccount: type == "存款" ? creditAccount : debitAccount,
            amount: amount,
            status: status == true ? "成功" : "失败",
            blockAccountBlance: balance
        })
    }

    //调用智能合约，查看余额
    if (type == "查询余额") {
        var fromBlockAccount = "";
        var fromBlockAccountPwd = "";
        //获取区块链地址
        const p = new Promise((resolve, reject) => {
            Card.findByNumber(debitAccount, (err, card) => {
                console.log(card)
                fromBlockAccount = card.blockAccount;
                fromBlockAccountPwd = card.blockPassword;
                resolve();
            });
        }).then(() => {
            balance = NodeContract.getBalance(fromBlockAccount, fromBlockAccountPwd);
            res.render('result', {
                bigTitle: type + "结果：",
                type: type,
                debitAccount: debitAccount,
                blockAccountBlance: balance
            })
        }).catch(err => {
            console.log(err);
        })
    }

}