//引入mongoose的建模工具模块
var mongoose = require('mongoose');
//引入card文件导出的cardSchema模块
var CardSchema = require('../schemas/card');
//编译生成Movie模型，传入模型名字和模式
var Card = mongoose.model('Card', CardSchema);
//将构造函数导出
module.exports = Card;