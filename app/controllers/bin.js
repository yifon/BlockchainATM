//加载编译的模型
var Bin = require('../models/bin');
var Bank = require('../models/bank');
var Card = require('../models/card');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

//bin列表页
exports.binlist = function (req, res) {
    Bin.fetch(function (err, binMappings) {
        if (err) {
            console.log(err);
        }
        res.render('binlist', {
            pageTitle: "BIN列表页",
            binMappings: binMappings
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
    //mongodb的增删查改操作默认是异步的，由于后面的操作需要用到tempId,所以需要将结果同步下去
    const promise = new Promise((resolve, reject) => {
        //无论是新创建还是更改，都要看数据库中是否有创建过此bin
        Bin.findByBin(binObj.bin, function (err, binMapping) {
            if (binMapping && binMapping._id != null) {
                tempId = binMapping._id;
            }
            resolve(tempId);
        })
    }).then(tempId => {
        if (id) {
            //如果是修改，则需检查新post的bin是否跟数据库中其它纪录重复
            if (tempId.toString() != id) {
                data = {
                    "success": false,
                    "msg": "此BIN已被其它注册过，请使用其它BIN！"
                }
                res.json(data);
            }
            //证明bin是存储进数据库过的，需要对其进行更新
            else Bin.findById(id, function (err, binMapping) {
                if (err) {
                    console.log(err);
                }
                //需要将post过来的bin数据替换掉数据库中老的bin数据
                /**
                 * _.extend(destination,source)
                 */
                _bin = _.extend(binMapping, binObj);
                _bin.save(function (err, binMapping) {
                    if (err) {
                        console.log(err);
                        data = {
                            "success": false,
                            "msg": "创建失败！"
                        }
                    }
                    //保存成功后，跳转到bin列表页
                    data = {
                        "success": true,
                        "msg": "创建成功！"
                    }
                    res.json(data);
                })
            })
        }
        //如果bin是新加的，则直接调用模型的构造函数，来传入bin数据
        else if (tempId == "") {
            _bin = new Bin(binObj);
            _bin.save(function (err, binMapping) {
                if (err) {
                    console.log(err);
                }
                //通过所属银行名字拿到当前bin对应的银行
                Bank.findByName(binMapping.bank, (err, bank) => {
                    bank.bins.push(binMapping.bin);//将bin存到所属的银行中
                    bank.save((err, bank) => {
                        //保存成功后，跳转到bin列表页
                        data = {
                            "success": true,
                            "message": "创建成功！"
                        }
                        res.json(data);
                    })
                })

            })
        }
        //新创建的bin在数据库中存在过
        else {
            data = {
                "success": false,
                "msg": "此BIN已被其它注册过，请使用其它BIN！"
            }
            res.json(data);
        }

    }).catch(error => {
        console.log(error);
    })
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
    var bin = req.query.bin;
    var bank = req.query.bank;
    var data;
    if (bin) {
        Bin.remove({ "bin": bin }, (err, newBinObj) => {
            if (err) {
                console.log(err);
            }
        });
        //将bin在注册的银行中删除
        Bank.update({ "name": bank }, { $pull: { "bins": bin } }, (err, bank) => {
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
