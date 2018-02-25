var mongoose = require('mongoose');//引入mongoose的建模工具模块
var TransactionSchema = require('../schemas/transaction');//引入transaction文件导出的Transaction模块
var Transaction = mongoose.model('Transaction', TransactionSchema);//编译生成transaction模型，传入模型名字和模式

module.exports = Transaction;//将构造函数导出