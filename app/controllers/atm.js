//加载编译的模型
var Atm = require('../models/atm');
var Bank = require('../models/bank');
var async = require('async');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

var fs = require('fs');
var path = require('path');
//atm列表页
exports.atmlist = function (req, res) {
    var tempAtmArr = [];
    Atm.fetch(function (err, atms) {
        if (err) {
            console.log(err);
        }
        //关联查询，返回查询的数组，再渲染页面
        async.each(atms, (atm, callback) => {
            Atm.findOne({ _id: atm._id })
                .populate({ path: 'bank', select: 'name' })
                .exec((err, atm) => {
                    tempAtmArr.push(atm);
                    callback(null);
                })
        }, err => {
            console.log(err);
            res.render('atmlist', {
                pageTitle: "ATM列表页",
                atms: tempAtmArr,
            })
        })
    })
}

//atm录入url，实现跳转到atm录入页
exports.new = function (req, res) {
    Bank.find({}, (err, banks) => {
        res.render('atmCreate', {
            pageTitle: "ATM信息录入页",
            atm: {},
            banks: banks
        });
    });
}

//atm上传图片
exports.savePicture = (req, res, next) => {
    var atmPicture = req.files.uploadPicture;//通过name值拿到上传的ATM图片
    if (atmPicture) {
        var filePath = atmPicture.path;
        var originalFilename = atmPicture.originalFilename;//拿到原始名字
        if (originalFilename) {
            fs.readFile(filePath, function (err, data) {
                var timestamp = Date.now();
                var type = atmPicture.type.split('/')[1];//jpeg,png..
                var picture = timestamp + '.' + type;
                var newPath = path.join(__dirname, '../../', '/public/upload/' + picture)//生成服务器的存储地址
                fs.writeFile(newPath, data, function (err) {
                    req.picture = picture;
                    next();
                })
            })
        }
    }
    else {
        next();//若无文件上传，则进入下一个环节
    }
}

//atm录入页提交的信息存储到数据库中
exports.save = function (req, res) {
    //传过来的数据可能是新添加的，也可能是修改已存在的数据
    //需要拿到传过来的id
    var id = req.body.atm._id;
    var atmObj = req.body.atm;//拿到传过来的atm对象
    var txnArray = [];
    txnArray = atmObj.supportedTxns.split(',');//将formData传的字符串转换成数组
    console.log(txnArray);
    atmObj.supportedTxns = txnArray;
    var bankId = atmObj.bank;//所属的银行id
    var _atm;
    var tempId = "";
    //传来atm图片，则要重写atm图片地址
    if (req.picture) {
        atmObj.picture = req.picture;
    }
    //mongodb的增删查改操作默认是异步的，由于后面的操作需要用到tempId,所以需要将结果同步下去
    const promise = new Promise((resolve, reject) => {
        //无论是新创建还是更改，都要看数据库中是否有创建过此atm id
        Atm.findByAtmId(atmObj.atmId, function (err, atm) {
            if (atm && atm._id != null) {
                tempId = atm._id;
            }
            resolve([tempId, atm]);
        })
    }).then(([tempId, atm]) => {
        if (id) {
            //如果是修改，则需检查新post的atm id是否跟数据库中其它纪录重复
            if ("" != tempId && tempId.toString() != id) {
                data = {
                    "success": false,
                    "msg": "此ATM ID已被其它银行注册过，请使用其它ATM ID！"
                }
                res.json(data);
            }
            //证明atm id是存储进数据库过的，需要对其进行更新
            else {
                //如果有更新图片，则需要将原路径的图片删除
                if (req.picture) {
                    var delPicturePath = path.join(__dirname, '../../', '/public/upload/' + atm.picture);
                    //存在则删除
                    if (fs.existsSync(delPicturePath)) {
                        fs.unlinkSync(delPicturePath);
                    }
                }

                //需要将post过来的atm数据替换掉数据库中老的atm数据
                /**
                 * _.extend(destination,source)
                 */
                _atm = _.extend(atm, atmObj);
                _atm.save(function (err, atmObj) {
                    if (err) {
                        throw (err);
                    }
                    //保存成功后，跳转到bin列表页
                    data = {
                        "success": true,
                        "msg": "创建成功！"
                    }
                    res.json(data);
                });
            }
        }
        //如果atm id是新加的，则直接调用模型的构造函数，来传入atm数据
        else {
            _atm = new Atm(atmObj);
            const p = new Promise((resolve, reject) => {
                _atm.save((err, atm) => {
                    if (err) {
                        console.log(err);
                        throw (err);
                    }
                    //通过所属银行id拿到当前atm对应的银行
                    if (bankId) {
                        Bank.findById(bankId, (err, bank) => {
                            bank.atms.push(atm._id);//将atm._id存到所属的银行中
                            bank.save((err, bank) => {
                                if (err) {
                                    console.log(err);
                                    throw (err);
                                }
                            })
                        })
                    }
                    resolve();
                })
            }).then(() => {
                //保存成功后，跳转到bin列表页
                data = {
                    "success": true,
                    "message": "创建成功！"
                }
                res.json(data);
            }).catch(error => {
                data = {
                    "success": false,
                    "msg": "创建ATM失败!"
                }
                res.json(data);
            })
        }
    })
}

//atm详情页
exports.detail = function (req, res) {
    var id = req.params.id;//id为查询的id
    //传入id,从回调方法里拿到查询到的atm数据
    Atm.findOne({ _id: id })
        .populate({ path: 'bank', select: 'name' })
        .exec((err, atm) => {
            res.render('atmDetail', {
                pageTitle: "ATM详情页",
                atm: atm//传入atm对象
            })
        })
}

//修改atm录入信息
//在列表页点击更新时，会跳转到后台录入post页，同时要初始化表单数据
exports.update = function (req, res) {
    //先拿到id,判断id是否存在
    var id = req.params.id;
    //若id存在，则通过模型Atm来拿到数据库中已有的Atm信息
    if (id) {
        Atm.findById(id, (err, atm) => {
            //获取所有的银行
            Bank.find({}, (err, banks) => {
                //拿到atm数据后，直接去渲染表单，即atm录入页
                res.render('atmCreate', {
                    pageTitle: "ATM录入页",
                    atm: atm,//将数据库中查到的atm数据传入表单
                    banks: banks
                })

            })
        })
    }
}
//删除atm
exports.del = function (req, res) {
    var atmId = req.query.atmId;
    var bank = req.query.bank;
    var picture = req.query.picture;
    var data;
    if (atmId) {
        //将atm从atm collection里删掉
        Atm.remove({ "atmId": atmId }, (err, newAtm) => {
            if (err) {
                console.log(err);
            }
        });
        //将atm在注册的银行中删除
        Bank.update({ "name": bank }, { $pull: { "atms": atmId } }, (err, bank) => {
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
        //删掉对应的图片文件
        if (picture != "undefined") {
            var delPicturePath = path.join(__dirname, '../../', '/public/upload/' + picture);
            //存在则删除
            if (fs.existsSync(delPicturePath)) {
                fs.unlinkSync(delPicturePath);
            }
        }
    }
}
