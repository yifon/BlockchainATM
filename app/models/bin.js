//引入mongoose的建模工具模块
var mongoose = require('mongoose');
//引入bin文件导出的BinSchema模块
var BinSchema = require('../schemas/bin');
//编译生成Bin模型，传入模型名字和模式
var Bin = mongoose.model('Bin', BinSchema);
//将构造函数导出
module.exports = Bin;