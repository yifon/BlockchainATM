//加载编译的模型
var Bank = require('../models/bank');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

//bank列表页
exports.banklist = function (req, res) {
    Bank.fetch(function (err, banks) {
        if (err) {
            console.log(err);
        }
        res.render('banklist', {
            pageTitle: "银行列表页",
            banks: banks
        })
    })
}

//bank录入url，实现跳转到bank录入页
exports.new = function (req, res) {
    res.render('bankCreate', {
        pageTitle: "银行信息录入页",
        bank: {}
    })
}

//bank录入页提交的信息存储到数据库中
exports.save = function (req, res) {
    console.log("here");
    //传过来的数据可能是新添加的，也可能是修改已存在的数据
    //需要拿到传过来的id
    var id = req.body.bank._id;
    var bankObj = req.body.bank;//拿到传过来的bank对象
    var _bank;
    var data;
    var tempId = "";//查看当前的bank是否在数据库中有其它人注册过
    //mongodb的增删查改操作默认是异步的，由于后面的操作需要用到tempId,所以需要将结果同步下去
    const promise = new Promise((resolve, reject) => {
        //无论是新创建还是更改，都要看数据库中是否有创建过此bank
        Bank.findByName(bankObj.name, function (err, bank) {
            if (bank && bank._id != null) {
                tempId = bank._id;
            }
            resolve(tempId);
        })
    }).then(tempId => {
        if (id) {
            //如果是修改，则需检查新post的bank是否跟数据库中其它纪录重复
            if (tempId.toString() != id) {
                data = {
                    "success": false,
                    "msg": "此名字已被其它银行注册过，请使用其它名字！"
                }
                res.json(data);
            }
            //证明bank是存储进数据库过的，需要对其进行更新
            else Bank.findById(id, function (err, bank) {
                if (err) {
                    console.log(err);
                }
                //需要将post过来的bank数据替换掉数据库中老的bank数据
                /**
                 * _.extend(destination,source)
                 */
                _bank = _.extend(bank, bankObj);
                _bank.save(function (err, bank) {
                    if (err) {
                        console.log(err);
                        data = {
                            "success": false,
                            "msg": "创建失败！"
                        }
                    }
                    //保存成功后，跳转到bank列表页
                    data = {
                        "success": true,
                        "msg": "创建成功！"
                    }
                    res.json(data);
                })
            })
        }
        //如果bank是新加的，则直接调用模型的构造函数，来传入bank数据
        else if (tempId == "") {
            _bank = new Bank(bankObj);
            _bank.save(function (err, bank) {
                if (err) {
                    console.log(err);
                }
                //保存成功后，跳转到bank列表页
                data = {
                    "success": true,
                    "message": "创建成功！"
                }
                res.json(data);
            })
        }
        //新创建的bank在数据库中存在过
        else {
            data = {
                "success": false,
                "msg": "此bank已被其它注册过，请使用其它bank！"
            }
            res.json(data);
        }

    }).catch((error) => {
        console.log(error);
    });
}

//修改bank录入信息
//在列表页点击更新时，会跳转到后台录入post页，同时要初始化表单数据
exports.update = function (req, res) {
    //先拿到id,判断id是否存在
    var id = req.params.id;
    //若id存在，则通过模型bank来拿到数据库中已有的bank信息
    if (id) {
        Bank.findById(id, function (err, bank) {
            //拿到bank数据后，直接去渲染表单，即bank录入页
            res.render('bankCreate', {
                pageTitle: "银行信息录入页",
                bank: bank//将数据库中查到的bank数据传入表单
            })
        })
    }
}
//删除bank
exports.del = function (req, res) {
    var id = req.query.id;
    var data;
    if (id) {
        Bank.remove({ _id: id }, function (err, bank) {
            if (err) {
                data = {
                    "success": false,
                    "msg": "删除失败！"
                };
            }
            //如果没有异常，则给客户端返回json数据
            else {
                data = {
                    "success": true,
                    "msg": "删除成功！"
                };

            }
            res.json(data);
        })
    }
}
