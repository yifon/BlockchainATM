//引入mongoose的建模工具模块
var mongoose = require('mongoose');
//引入atm文件导出的AtmSchema模块
var AtmSchema = require('../schemas/atm');
//编译生成Atm模型，传入模型名字和模式
var Atm = mongoose.model('Atm', AtmSchema);
//将构造函数导出
module.exports = Atm;