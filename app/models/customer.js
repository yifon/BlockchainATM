var mongoose = require('mongoose');//引入mongoose的建模工具模块
var CustomerSchema = require('../schemas/customer');//引入customer文件导出的Customer模块
var Customer = mongoose.model('Customer', CustomerSchema);//编译生成Customer模型，传入模型名字和模式

module.exports = Customer;//将构造函数导出