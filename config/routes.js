//拿到控制层的入口文件
var Index = require('../app/controllers/index');
var Atm = require('../app/controllers/atm');
var Bin = require('../app/controllers/bin');
var Bank = require('../app/controllers/bank');
var Card = require('../app/controllers/card');
var Transaction = require('../app/controllers/transaction');

module.exports = function (app) {
    //为客人信息设置缓存
    app.use(function (req, res, next) {
        var _customer = req.session.customer;
        app.locals.customer = _customer;//设置为全局
        return next();
    })

    //编写路由
    app.get('/', Index.welcome);//首页
    app.get('/enterAcc', Index.enterAcc);//下一个页面是enter account
    app.post('/submitAcc', Index.submitAcc);//验证输入的账户
    app.get('/enterPwd', Index.enterPwd);//下一个页面是enter password
    app.post('/submitPwd', Index.submitPwd);//验证输入的密码
    app.get('/chooseAtm', Index.chooseAtm);//选择服务的ATM

    //atm信息
    app.get('/admin/atm/new', Atm.new);//atm录入页
    app.get('/admin/atm/list', Atm.atmlist);//atm列表页
    app.post('/admin/atm', Atm.savePicture, Atm.save);//将atm录入页的信息存储到数据库中
    app.get('/atm/:id', Atm.detail);//具体某台atm的详情页
    app.get('/admin/atm/update/:id', Atm.update);//修改atm信息
    app.delete('/admin/atm/list', Atm.del);//删除atm

    //bin信息
    app.get('/admin/bin/new', Bin.new);//bin录入页
    app.get('/admin/bin/list', Bin.binlist);//bin列表页
    app.post('/admin/bin', Bin.save);//将bin录入页的信息存储到数据库中
    app.get('/admin/bin/update/:id', Bin.update);//修改bin信息
    app.delete('/admin/bin/list', Bin.del);//删除bin

    //bank信息
    app.get('/admin/bank/new', Bank.new);//bank录入页
    app.get('/admin/bank/list', Bank.banklist);//bank列表页
    app.post('/admin/bank', Bank.save);//将bank录入页的信息存储到数据库中
    app.get('/admin/bank/update/:id', Bank.update);//修改bank信息
    app.delete('/admin/bank/list', Bank.del);//删除bank

    //card信息
    app.get('/admin/card/new', Card.new);//card
    app.get('/admin/card/list', Card.cardlist);//card列表页
    app.post('/admin/card', Card.save);//将card录入页的信息存储到数据库中
    app.get('/admin/card/update/:id', Card.update);//修改card信息
    app.delete('/admin/card/list', Card.del);//删除card

    //transaction信息
    app.get('/admin/transaction/list', Transaction.transactionlist);//transaction信息
}