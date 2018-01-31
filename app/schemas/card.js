//传入mongoose的建模工具模块
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;//声明一个对象ID类型，等同于MongooseDB内置的_id类型，由24位Hash字符串组成

//传入与card有关的字段和类型
var CardSchema = new Schema({
    //获取在BIN创建页创建过的银行,一个Card只有一个Bin
    bank: {
        type: String,
        ref: 'Bank'
    },
    bin: {
        type: String,
        ref: 'Bin'
    },
    number: {
        unique: true,//卡号唯一
        type: String
    },
    name: String,//客人姓名
    password: Number,//银行卡密码
    balance: Number,//银行卡余额
    //meta存放的是录入或者更新数据时的时间纪录
    meta: {
        //创建时间
        createAt: {
            type: Date,
            default: Date.now()
        },
        //更新时间
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})
//为模式创建方法，pre-save表示每次存储前都会调用此方法
CardSchema.pre('save', function (next) {
    //判断数据是否为新添加的，如果时，则将创建时间设置为当前时间
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    }
    //若只是单纯的修改，则只需将修改时间设置为当前时间
    else {
        this.meta.updateAt = Date.now();
    }
    next();//将存储流程走下去
})
//静态方法不会直接与数据库交互，只有经过模型编译和实例化后，才会具有此方法
CardSchema.statics = {
    //取出数据库中所有的纪录(按更新时间排序，执行茶叙，并将结果传入回调方法)
    fetch: function (cb) {
        return this.find({}).sort('meta.updateAt').exec(cb);
    },
    //查询数据库中单条数据（根据_id去查找）
    findById: function (id, cb) {
        return this.findOne({ _id: id }).exec(cb);//执行查询，并将结果传入回调方法
    },
    //查询数据库中单条数据（根据卡号去查找）
    findByNumber: function (number, cb) {
        return this.findOne({ number: number }).exec(cb);//执行查询，并将结果传入回调方法
    }
}
//将模式导出
module.exports = CardSchema;
