//拿到控制层的入口文件
var Index = require('../app/controllers/index');

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
}