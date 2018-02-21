//拿到控制层的入口文件
var Index = require('../app/controllers/index');
var Atm = require('../app/controllers/atm');
var Bin = require('../app/controllers/bin');
var Bank = require('../app/controllers/bank');
var Card = require('../app/controllers/card');
var Transaction = require('../app/controllers/transaction');
// var Blockchain = require('../app/controllers/blockchain');//ATM<->Blockchain部分
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
    app.post('/submitAcc', Index.submitAcc);//验证输入的账户和密码
    app.get('/chooseAtm', Index.chooseAtm);//选择服务的ATM
    app.post('/confirmAtm', Index.confirmAtm);//确认ATM
    app.get('/chooseTxn', Index.chooseTxn);//选择交易类型
    app.post('/confirmTxn', Index.confirmTxn);//确认交易类型
    app.get('/enterValue', Index.enterValue);//取款／存款：跳转到输入取款／存款数额页面;转账：跳转到输入收款银行卡卡页面
    app.get('/result' + Index.result);//查询余额：跳转到结果页面；取款／存款：输入完数额后跳转到结果页面；转账：输入收款银行卡后跳转到结果页面

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

    //处理ATM与区块链部分的事件交互
    // app.get('/test', Blockchain.test);
    // app.post('/startTrx', Blockchain.startTrx);//ATM->Blockchain,通知Blockchain开始交易
    // app.post('/confirmDebit', Blockchain.confirmDebit);//ATM->Blockchain,ATM与银行交互结束后,通知Blockchain可以确认扣款
    // app.post('/confirmCredit', Blockchain.confirmCredit);//ATM->Blockchain,ATM与银行交互结束后,通知Blockchain可以确认收款
}