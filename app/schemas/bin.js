//传入mongoose的建模工具模块
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;//声明一个对象ID类型，等同于MongooseDB内置的_id类型，由24位Hash字符串组成

//传入与bin有关的字段和类型
var BinSchema = new Schema({
    bin: {
        unique: true,//bin id不可重复
        type: Number
    },
    //数组，保存card,一个Bin可以有多个Card
    cards: [{
        type: String,
        ref: 'Card'
    }],
    //数组，保存bank的,一个bin只属于一个bank
    bank: {
        type: String,
        ref: 'Bank'
    },
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
BinSchema.pre('save', function (next) {
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
BinSchema.statics = {
    //取出数据库中所有的纪录(按更新时间排序，执行茶叙，并将结果传入回调方法)
    fetch: function (cb) {
        return this.find({}).sort('meta.updateAt').exec(cb);
    },
    //查询数据库中单条数据（根据_id去查找）
    findById: function (id, cb) {
        return this.findOne({ _id: id }).exec(cb);//执行查询，并将结果传入回调方法
    },
    //查询数据库中单条数据（根据bin去查找）
    findByBin: function (bin, cb) {
        return this.findOne({ bin: bin }).exec(cb);//执行查询，并将结果传入回调方法
    }
}
//将模式导出
module.exports = BinSchema;
