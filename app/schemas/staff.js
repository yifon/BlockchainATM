    //传入mongoose的建模工具模块
var mongoose = require('mongoose');
var StaffSchema = new mongoose.Schema({
    staffId: String,
    sex: String,
    name: String,
    job: String
});
//为模式创建方法，每次存储前都会调用此方法
StaffSchema.pre('save', function (next) {
    var staff = this;
    next();
})

//添加实例方法
StaffSchema.methods = {

}

//静态方法不会直接与数据库交互，只有经过模型编译和实例化，才会具有此方法
StaffSchema.statics = {
    //取出数据库中所有的数据
    fetch: function (cb) {
        return this.find({}).exec(cb);//执行查询，并将结果传入回调方法       
    },
    //查询数据库中单条的数据
    findByStaffId: function (staffId, cb) {
        console.log("staffId->"+staffId);
        return this.findOne({ staffId: staffId }).exec(cb);//执行查询，并将结果传入回调方法
    }
}
//将模式导出
module.exports = StaffSchema;