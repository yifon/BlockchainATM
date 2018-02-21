var Card = require('../models/card');
var Atm = require('../models/atm');
var async = require('async');
//首页，开始交易
exports.welcome = function (req, res) {
    delete req.session.transaction;//清除transaction的session数据
    req.session.transaction = {
        debitAccount: "",
        type: "",
        startTime: "",
        endTime: "",
        fromAtm: "",
        debitAtm: "",
        debitBank: "",
        creditAtm: "",
        creditAtm: "",
        amount: "",
        fee: "",
        status: ""
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
                    req.session.transaction["debitAccount"] = _customer.debitAccount;//将debitAccount存储在session中
                    req.session.transaction['debitBank'] = card.bank;
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
    console.log("debitBank:" + req.session.transaction["debitBank"]);
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
    console.log(req.body.txn.atmId);
    req.session.transaction["fromAtm"] = req.body.txn.atmId;
    console.log(req.session.transaction)
    var data;
    data = {
        "success": true,
        "msg": "/chooseTxn?supportedTxns=" + req.body.txn.supportedTxns
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
    console.log(req.session.transaction);
    var result = "/";
    switch (type) {
        case '查询余额':
            data = {
                "success": true,
                "msg": "/result"
            }
            break;
        case '取款':
        case '存款':
        case '转账':
            data = {
                "success": true,
                "msg": "/enterValue"
            }
            break;
        default:
            data = {
                "success": false,
                "msg": "服务器异常"
            }
            break;
    }
    res.json(data);
}

/**
 * 输入数额页面;输入收款银行卡页面
 */
exports.enterValue = (req, res) => {
    var type = req.session.transaction["type"];
    res.render('enterValue', {
        bigTitle: "请输入您的" + type + "数额："
    })
}
/**
 * 结果页面：
 * 查询余额：跳转到结果页面
 * 取款／存款：输入取款／存款数额后跳转到结果页面
 * 转账：输入收款银行卡后跳转到结果页面
 */
exports.result = (req, res) => {
    var type = req.session.transaction["type"];
    var cardNumber = req.session.transaction["debitAccount"];
    var msg = "";
    if (type == "取款" || type == "存款" || type == "转账") {
        var amount = req.session.transaction["amount"];
        msg += "您的" + type + "数额为:" + amount + "\n";
    }
    msg += "您当前的卡号" + cardNumber + "的余额为：";
    res.render('result', {
        bigTitle: type + "结果：",
        msg: msg,
    })
}