var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var CustomerSchema = new mongoose.Schema({
    debitAccount: String,//扣款账号，即客人本人的卡
    issueBank: String,//客人的卡所属的银行
    password: Number, //客人账户密码
    creditAccount: String,//转入的账号
    fromAtm: String,//操作ATM
    amount: Number//交易数额
})