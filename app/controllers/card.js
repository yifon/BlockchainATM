//加载编译的模型
var Card = require('../models/card');
var Bin = require('../models/bin');

//underscore内的extend方法可以实现用另外一个对象内新的字段来替换掉老的对象里对应的字段
var _ = require('underscore');


//card列表页
exports.cardlist = function (req, res) {
    Card.fetch(function (err, cards) {
        if (err) {
            console.log(err);
        }
        res.render('cardlist', {
            pageTitle: "银行卡列表页",
            cards: cards//获取所有的银行卡信息
        })
    })
}

//card录入url，实现跳转到card录入页
exports.new = function (req, res) {
    //获取所有可以选择的bin对象信息
    Bin.fetch(function (err, bins) {
        if (err) {
            console.log(err);
        }
        res.render('cardCreate', {
            pageTitle: "银行卡信息录入页",
            bins: bins,
            card: {}
        })
    })
}

//卡录入页提交的信息存储到数据库中
exports.save = function (req, res) {
    //传过来的数据可能是新添加的，也可能是修改已存在的数据
    //需要拿到传过来的id
    var id = req.body.card._id;
    var cardbj = req.body.card;//拿到传过来的card对象
    var _card;
    if (id) {
        //证明card是存储进数据库过的，需要对其进行更新
        card.findById(id, function (err, card) {
            if (err) {
                console.log(err);
            }
            //需要将post过来的card数据替换掉数据库中老的card数据
            /**
             * _.extend(destination,source)
             */
            _card = _.extend(card, cardObj);
            _card.save(function (err, card) {
                if (err) {
                    console.log(err);
                }
                //保存成功后，跳转到新的详情页
                res.redirect('/card/' + card._id);
            })
        })
    }
    //如果card是新加的，则直接调用模型的构造函数，来传入card数据
    else {
        _card = new Card(cardObj);
        _card.save(function (err, card) {
            if (err) {
                console.log(err);
            }
            //保存成功后，跳转到新的详情页
            res.redirect('/card/' + card._id);
        })
    }
}

//card详情页
exports.detail = function (req, res) {
    var id = req.params.id;//id为查询的id
    //传入id,从回调方法里拿到查询到的card数据
    card.findById(id, function (err, card) {
        res.render('cardDetail', {
            pageTitle: "card详情页",
            card: card//传入card对象
        })
    })
}

//修改card录入信息
//在列表页点击更新时，会跳转到后台录入post页，同时要初始化表单数据
exports.update = function (req, res) {
    //先拿到id,判断id是否存在
    var id = req.params.id;
    //若id存在，则通过模型card来拿到数据库中已有的card信息
    if (id) {
        card.findById(id, function (err, card) {
            //拿到card数据后，直接去渲染表单，即card录入页
            res.render('cardCreate', {
                pageTitle: "card录入页",
                card: card//将数据库中查到的card数据传入表单
            })
        })
    }
}
//删除card
exports.del = function (req, res) {
    var id = req.query.id;
    var data;
    if (id) {
        card.remove({ _id: id }, function (err, card) {
            if (err) {
                data = {
                    "success": false,
                    "message": "删除失败！"
                };
            }
            //如果没有异常，则给客户端返回json数据
            else {
                data = {
                    "success": true,
                    "message": "删除成功！"
                };

            }
            res.json(data);
        })
    }
}
