//加载编译的模型
var Bin = require('../models/bin');
var Bank = require('../models/bank');
var async = require('async');
//传入mongoose的建模工具模块
var mongoose = require('mongoose');


//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

//bin列表页
exports.binlist = (req, res) => {
    var tempBinArr = [];
    Bin.fetch((err, binMappings) => {
        if (err) {
            console.log(err);
        }
        //关联查询，返回查询的数组，再渲染页面
        async.each(binMappings, (binMapping, callback) => {
            Bin.findOne({ _id: binMapping._id })
                .populate({ path: 'bank', select: 'name' })
                .exec((err, bin) => {
                    tempBinArr.push(bin);
                    callback(null);
                })
        }, err => {
            console.log(err);
            res.render('binlist', {
                pageTitle: "BIN列表页",
                binMappings: tempBinArr,
            })
        })

    })
}

//bin录入url，实现跳转到bin录入页
exports.new = function (req, res) {
    //返回所有可以选择的银行
    Bank.find({}, (err, banks) => {
        res.render('binCreate', {
            pageTitle: "BIN信息录入页",
            binMapping: {},
            banks: banks
        })
    })
}

//bin录入页提交的信息存储到数据库中
exports.save = function (req, res) {
    //传过来的数据可能是新添加的，也可能是修改已存在的数据
    //需要拿到传过来的id
    var id = req.body.binMapping._id;
    var binObj = req.body.binMapping;//拿到传过来的bin对象
    var _bin;
    var data;
    var tempId = "";//查看当前的bin是否在数据库中有其它人注册过

    if (id) {
        //如果是修改，则需检查新post的bin是否跟数据库中其它纪录重复
        const p = new Promise((resolve, reject) => {
            Bin.findByBin(binObj.bin, function (err, binMapping) {
                if (binMapping && binMapping._id != null) {
                    tempId = binMapping._id.toString();
                }
                resolve(tempId, binMapping);
                console.log("tempId:" + tempId);
            })
        }).then((tempId, binMapping) => {
            if ("" != tempId && tempId != id) {
                data = {
                    "success": false,
                    "msg": "此BIN已被其它注册过，请使用其它BIN！"
                }
                res.json(data);
            }
            //证明bin是存储进数据库过的，需要对其进行更新
            else {
                //需要将post过来的bin数据替换掉数据库中老的bin数据
                _bin = _.extend(binMapping, binObj);
                _bin.save(function (err, newBin) {
                    if (err) {
                        console.log(err);
                    }

                    //保存成功后，跳转到bin列表页
                    data = {
                        "success": true,
                        "msg": "创建成功！"
                    }
                    res.json(data);
                })
            }
        })
    }
    //如果bin是新加的，则直接调用模型的构造函数，来传入bin数据
    else {
        _bin = new Bin(binObj);
        var bankId = binObj.bank;
        console.log(_bin)
        _bin.save(function (err, binMapping) {
            if (err) {
                console.log(err);
            }
            //通过bankId拿到当前对应的bank
            if (bankId) {
                Bank.findById(bankId, (err, bank) => {
                    bank.bins.push(_bin._id);
                    bank.save((err, bank) => {
                        //保存成功后，跳转到bin列表页
                        data = {
                            "success": true,
                            "message": "创建成功！"
                        }
                        res.json(data);
                    })
                })
            }
        })
    }
}

//修改bin录入信息
//在列表页点击更新时，会跳转到后台录入post页，同时要初始化表单数据
exports.update = function (req, res) {
    //先拿到id,判断id是否存在
    var id = req.params.id;
    //若id存在，则通过模型bin来拿到数据库中已有的bin信息
    if (id) {
        Bin.findById(id, (err, binMapping) => {
            //获取所有的银行
            Bank.find({}, (err, banks) => {
                //拿到bin数据后，直接去渲染表单，即bin录入页
                res.render('binCreate', {
                    pageTitle: "bin录入页",
                    binMapping: binMapping,//将数据库中查到的bin数据传入表单
                    banks: banks
                });
            });
        })
    }
}
//删除bin
exports.del = function (req, res) {
    var id = req.query._id;
    var bank = req.query.bank;
    console.log(bank);
    var data;
    if (id) {
        Bin.remove({ _id: id }, (err, newBinObj) => {
            if (err) {
                console.log(err);
            }
        });
        //将bin在注册的银行中删除
        Bank.update({ "name": bank }, { $pull: { "bins": mongoose.Types.ObjectId(id) } }, (err, bank) => {
            if (err) {
                console.log(err);
            } else {
                //如果没有异常，则给客户端返回json数据
                data = {
                    "success": true,
                    "msg": "删除成功！"
                };
                res.json(data);
            }

        });
    }
}
