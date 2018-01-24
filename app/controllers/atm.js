//加载编译的模型
var Atm = require('../models/atm');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

var fs = require('fs');
var path = require('path');

//atm列表页
exports.atmlist = function (req, res) {
    Atm.fetch(function (err, atms) {
        if (err) {
            console.log(err);
        }
        res.render('atmlist', {
            pageTitle: "ATM列表页",
            atms: atms
        })
    })
}

//atm录入url，实现跳转到atm录入页
exports.new = function (req, res) {
    res.render('atmCreate', {
        pageTitle: "ATM信息录入页",
        atm: {}
    })
}

//atm上传图片
exports.savePicture = function (req, res, next) {
    console.log(req.files);
    var atmPicture = req.files.uploadPicture;//通过name值拿到上传的ATM图片
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
    var _atm;
    //传来atm图片，则要重写atm图片地址
    if (req.picture) {
        atmObj.picture = req.picture;
    }
    if (id) {
        //证明atm是存储进数据库过的，需要对其进行更新
        Atm.findById(id, function (err, atm) {
            if (err) {
                console.log(err);
            }
            //需要将post过来的atm数据替换掉数据库中老的atm数据
            /**
             * _.extend(destination,source)
             */
            _atm = _.extend(atm, atmObj);
            _atm.save(function (err, atm) {
                if (err) {
                    console.log(err);
                }
                //保存成功后，跳转到新的详情页
                res.redirect('/atm/' + atm._id);
            })
        })
    }
    //如果atm是新加的，则直接调用模型的构造函数，来传入atm数据
    else {
        _atm = new Atm(atmObj);
        _atm.save(function (err, atm) {
            if (err) {
                console.log(err);
            }
            //保存成功后，跳转到新的详情页
            res.redirect('/atm/' + atm._id);
        })
    }
}

//atm详情页
exports.detail = function (req, res) {
    var id = req.params.id;//id为查询的id
    //传入id,从回调方法里拿到查询到的atm数据
    Atm.findById(id, function (err, atm) {
        res.render('atmDetail', {
            pageTitle: "ATM详情页",
            atm: atm//传入atm对象
        })
    })
}
