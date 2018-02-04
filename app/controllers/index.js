var Customer = require('../models/customer');

//首页，开始交易
exports.welcome = function (req, res) {
    delete req.session.customer;//清除customer的session数据
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
    var _customer = req.body.customer;
    req.session.customer = _customer;
    var customer = req.session.customer;
    req.session.customer["debitAccount"] = _customer.debitAccount;//将debitAccount存储在session中
    var data = {
        "success": true,
        "msg": "/chooseAtm"
    };
    res.send(data);//先直接跳转，等待后边集成blockchain后做密码判断
}
//输入密码页
exports.enterPwd = function (req, res) {
    var _customer = req.session.customer;
    console.log("debitAccount:"+req.session.customer["debitAccount"]);
    if (typeof _customer == "undefined" || !_customer.hasOwnProperty("debitAccount") || _customer.debitAccount == "") {
        return res.redirect("/");//若未输入过卡号，则因跳转到首页
    }
    res.render('enterPwd', {
        bigTitle: "请输入您的密码："
    });
}
//验证客人输入的密码，验证成功则跳转到选择atm页
exports.submitPwd = function (req, res) {
    var _customer = req.body.customer;
    var customer = req.session.customer;
    req.session.customer["password"] = _customer.password;//将debitAccount存储在session中
    var data = {
        "success": true,
        "msg": "/chooseAtm"
    };
    res.send(data);//先直接跳转，等待后边集成blockchain后做密码判断
}
//选择ATM页
exports.chooseAtm = function (req, res) {
    var _customer = req.session.customer;
    console.log("password:"+req.session.customer["password"]);
    if (typeof _customer == "undefined" || !_customer.hasOwnProperty("debitAccount") || _customer.debitAccount == "") {
        return res.redirect("/");//若未输入过卡号，则因跳转到首页
    } else if (!_customer.hasOwnProperty("password")) {
        return res.redirect("/enterPwd");//若未输入过密码，则因跳转到输入密码页
    }
    res.render('chooseAtm', {
        bigTitle: "请选择服务的ATM:"
    });
}