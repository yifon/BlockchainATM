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

    //删除atm
    $("#delAtm").bind("click", function (e) {
        var target = $(e.target);
        var id = target.data('id');
        var tr = $(".item-id-" + id);
        console.log(id);
        $.ajax({
            type: "DELETE",//异步请求类型为del
            url: "/admin/atm/list?id=" + id
        })//删除后，服务器返回的状态
            .done(function (data) {
                if (data.message) {
                    if (tr.length > 0) {
                        tr.remove();
                        window.location.reload();//刷新内容
                    }
                }
            })
    });
    //新创建BIN，则需要去数据库中查询BIN是否被使用过了；若是修改银行信息，则BIN还可以使用
    $("#createBin").bind("click", function () {
        //确保BIN是6位的,且BIN和bank都有填写
        var checkResult = "";
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
                        bin: bin,
                        bank: bank
                    }
                },
                success: function () {
                    window.location = binlistUrl;
                },
                error: function (jqXHR) {
                    if (jqXHR.status) {
                        checkResult = "服务器异常：" + jqXHR.status;
                    }
                    else {
                        // checkResult = data.message;
                    }
                    $("#checkBin").html(checkResult);
                }

            })
        }
        $("#checkBin").html(checkResult);
    })
})