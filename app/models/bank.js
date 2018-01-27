//引入mongoose的建模工具模块
var mongoose = require('mongoose');
//引入bank文件导出的bankSchema模块
var BankSchema = require('../schemas/bank');
//编译生成bank模型，传入模型名字和模式
var Bank = mongoose.model('Bank', BankSchema);
//将构造函数导出
module.exports = Bank;