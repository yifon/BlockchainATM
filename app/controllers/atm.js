//加载编译的模型
var Atm = require('../models/atm');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');

//atm列表页
exports.atmlist = function (req, res) {
    Atm.fetch(function (err, atms) {
        if (err) {
            console.log(err);
        }
        res.render('atmlist', {
            atms: atms
        })
    })
}

//atm录入url，实现跳转到atm录入页
exports.new = function (req, res) {
    res.render('atmCreate', {
        atm: {}
    })
}

//atm录入页提交的信息存储到数据库中
exports.save = function (req, res) {
    //传过来的数据可能是新添加的，也可能是修改已存在的数据
    //需要拿到传过来的id
    var id = req.body.atm._id;
    var atmObj = req.body.atm;//拿到传过来的atm对象
    var _atm;
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
            atm: atm//传入atm对象
        })
    })
}
