/**
 * localhost:3000/staff //员工查询，创建，修改页面
 */
var express = require('express');//加载express模块
var app = express();//启动一个web服务器，将实例赋予给app变量
var port = process.env.PORT || 8080;//从命令行中设置port口，默认是3000
app.listen(port);//监听端口

var mongoose = require('mongoose');//引入mongoose模块，来连接本地数据库
var dbUrl = "mongodb://localhost:27017/BlockchainAtm";
mongoose.Promise = global.Promise;//Promise化mongodb的回调操作
// mongoose.connect(dbUrl, { useMongoClient: true });
mongoose.connect(dbUrl);

var path = require('path');//处理样式、脚本文件等路径等对象
app.use(express.static(path.join(__dirname, 'public')))//静态资源的获取，__dirname当前文件目录

app.set('views', './app/views/pages');//设置视图的根目录
app.set('view engine', 'jade');//设置默认的模版引擎

//添加moment模块用于格式化时间
app.locals.moment = require('moment');

var expressSession = require('express-session');//会话持久性判断
var mongoStore = require('connect-mongo')(expressSession);//利用mongodb做会话的持久性
var multipart = require('connect-multiparty');//文件上传模块
app.use(multipart({
    maxFilesSize: 5 * 1024 * 1024
}));
app.use(expressSession({
    secret: 'blockchainAtm',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions'
    })
}))

/**
 * proxy代理
 */
// var proxy = require('http-proxy-middleware');//引入代理中间件
// var dataProxy = proxy('/data', { target: "http://www.imooc.com/", changeOrigin: true });//将服务器代理到http://www.imooc.com上，本地服务器为localhost:3000
// app.use('/data/*', dataProxy);//data子目录下的都是用代理

/**
 * 解析请求的消息体
 */
var bodyParser = require('body-parser');
app.use(bodyParser.json());//返回一个只解析json的中间件，最后保存的数据都放在req.body对象上
app.use(bodyParser.urlencoded({ extended: true }));//返回的对象为任意类型

require('./config/routes')(app);//引用路由文件

console.log('Sever started successfully on port ' + port);