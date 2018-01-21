//引入mongoose的建模工具模块
var mongoose = require('mongoose');
//引入staff文件导出的StaffSchema模块
var StaffSchema = require('../schemas/staff');
//编译生成Staff模型，传入模型名字和模式
var Staff = mongoose.model('Staff', StaffSchema);
//将构造函数导出
module.exports = Staff;