var binlistUrl = "/admin/bin/list";
var binCreateUrl = "/admin/bin";

$(function () {
    //加载侧边导航栏
    var currentUrl = String(window.location);//转为string
    console.log(currentUrl);
    var html;
    if (currentUrl.indexOf("atm") != -1) {
        html = "<li><a href='/admin/atm/list'>ATM列表页</a></li><li><a href='/admin/atm/new'>创建ATM</a></li>";
        $("#sideBar").append(html);
    } else if (currentUrl.indexOf("bin") != -1) {
        html = "<li><a href='/admin/bin/list'>BIN列表页</a></li><li><a href='/admin/bin/new'>创建BIN</a></li>";
        $("#sideBar").append(html);
    } else if (currentUrl.indexOf("card") != -1) {
        html = "<li><a href='/admin/card/list'>银行卡列表页</a></li><li><a href='/admin/card/new'>创建银行卡</a></li>";
        $("#sideBar").append(html);
    }

    const promiseAtm = new Promise(function (resolve, reject) {
        $(".tempAtm").bind("click", function (e) {
            var target = $(e.target);
            var id = target.data('id');
            resolve(id);
        })
    });
    //删除bin
    promiseAtm.then(function (id) {
        var tr = $(".item-id-" + id);
        $("#delAtm").bind("click", function () {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/atm/list?id=" + id
            })//删除后，服务器返回的状态
                .done(function (data) {
                    if (data.msg) {
                        if (tr.length > 0) {
                            tr.remove();
                        }
                    }
                    window.location.reload();//刷新内容
                })
        });
    });
    //新创建BIN，则需要去数据库中查询BIN是否被使用过了；若是修改银行信息，则BIN还可以使用
    $("#createBin").bind("click", function () {
        //确保BIN是6位的,且BIN和bank都有填写
        var checkResult = "";
        var _id = $("#inputId").val();
        var bin = $("#inputBin").val();
        var bank = $("#inputBank").val();
        var type = /^[1-9][0-9]{5}$/;//以1-9开头,0-9结尾的6位数字
        var binType = new RegExp(type);
        if (!bin.match(type) || bank === "") {
            if (!bin.match(type)) {
                checkResult += "必须输入以1-9开头，0-9结尾的6位数字为BIN！";
            }
            if (!bank) {
                checkResult += "必须输入银行！";
            }
        } else {
            $.ajax({
                type: "POST",
                url: binCreateUrl,
                dataType: "JSON",
                data: {
                    binMapping: {
                        _id: _id,
                        bin: bin,
                        bank: bank
                    }
                },
                success: function (data) {
                    console.log("data.success:" + data.success);
                    if (data.success) {
                        window.location = binlistUrl;
                    } else {
                        checkResult = data.msg;
                    }
                    $("#checkBin").html(checkResult);
                },
                error: function (jqXHR) {
                    checkResult = "服务器异常：" + jqXHR.status;
                    $("#checkBin").html(checkResult);
                }
            })
        }
        $("#checkBin").html(checkResult);
    })
})
const promiseBin = new Promise(function (resolve, reject) {
    $(".tempId").bind("click", function (e) {
        var target = $(e.target);
        var id = target.data('id');
        resolve(id);
    })
});
//删除bin
promiseBin.then(function (id) {
    var tr = $(".item-id-" + id);
    $("#delBin").bind("click", function () {
        $.ajax({
            type: "DELETE",//异步请求类型为del
            url: "/admin/bin/list?id=" + id
        })//删除后，服务器返回的状态
            .done(function (data) {
                if (data.msg) {
                    if (tr.length > 0) {
                        tr.remove();
                    }
                }
                window.location.reload();//刷新内容
            })
    });
});