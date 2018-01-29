var atmCreateUrl = "/admin/atm";
var atmlistUrl = "/admin/atm/list";
var binCreateUrl = "/admin/bin";
var binlistUrl = "/admin/bin/list";
var bankCreateUrl = "/admin/bank";
var banklistUrl = "/admin/bank/list";

$(function () {
    //加载侧边导航栏
    var currentUrl = String(window.location);//转为string
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
    } else if (currentUrl.indexOf("bank") != -1) {
        html = "<li><a href='/admin/bank/list'>银行列表页</a></li><li><a href='/admin/bank/new'>注册新银行</a></li>";
        $("#sideBar").append(html);
    }

    //新创建ATM，则需要去数据库中查询ATM ID是否被使用过了
    $("#createAtm").bind("click", function () {
        //确保所有位都有选择
        var checkResult = "";
        var _id = $("#inputId").val();
        var bank = $("input[type='radio']:checked").val();
        var atmId = $("#inputAtmId").val();
        var location = $("#inputLocation").val();
        var supportedTxns = [];
        $("#selectSupportedTxns input[type='checkbox']:checked").each(function () {
            supportedTxns.push($(this).val());
        })
        var model = $("#inputModel").val();
        var vendor = $("#inputVendor").val();
        var picture = $("#inputPicture").val();
        var uploadPicture = $("#uploadPicture")[0].files[0];

        var formData = new FormData();

        if ((typeof _id) != "undefined") {
            formData.append('atm[_id]', _id);
        }
        formData.append('atm[bank]', bank);
        formData.append('atm[atmId]', atmId);
        formData.append('atm[location]', location);
        formData.append('atm[supportedTxns]', supportedTxns);//传的是字符串
        formData.append('atm[model]', model);
        formData.append('atm[vendor]', vendor);
        formData.append('atm[picture]', picture);
        formData.append('uploadPicture', uploadPicture);

        if (!bank || !atmId || !location || !supportedTxns || !model || !vendor || !picture && !uploadPicture) {
            if (!bank) {
                checkResult += "必须选择一家银行！";
            }
            if (!atmId) {
                checkResult += "必须输入ATM ID！";
            }
            if (!location) {
                checkResult += "必须输入地址！";
            }
            if (!supportedTxns) {
                checkResult += "必须输入支持的交易！";
            }
            if (!model) {
                checkResult += "必须输入设备模型！";
            }
            if (!vendor) {
                checkResult += "必须输入供应商！";
            }
            if (!picture) {
                if (!uploadPicture)
                    checkResult += "必须输入图片地址或上传图片！";
            }
        } else {
            $.ajax({
                type: "POST",
                url: atmCreateUrl,
                contentType: false,
                processData: false,
                data: formData,
                success: function (data) {
                    if (data.success) {
                        window.location = atmlistUrl;
                    } else {
                        checkResult = data.msg;
                    }
                    $("#checkAtm").html(checkResult);
                },
                error: function (jqXHR) {
                    checkResult = "服务器异常：" + jqXHR.status;
                    $("#checkAtm").html(checkResult);
                }
            })
        }
        $("#checkAtm").html(checkResult);
    })
    const promiseAtm = new Promise((resolve, reject) => {
        $(".tempAtm").bind("click", function (e) {
            var target = $(e.target);
            var id = target.data('id');
            var atmId = target.data('atmid');
            alert(atmId)
            var bank = target.data('bank');
            var picture = target.data('picture');
            resolve([id, atmId, bank, picture]);
        })
    }).then(([id, atmId, bank, picture]) => {
        var tr = $(".item-id-" + id);
        $("#delAtm").bind("click", function () {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/atm/list?atmId=" + atmId + "&bank=" + bank + "&picture=" + picture
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
    }).catch(error => {
        console.log(error);
    });
    //新创建BIN，则需要去数据库中查询BIN是否被使用过了；若是修改银行信息，则BIN还可以使用
    $("#createBin").bind("click", function () {
        //确保BIN是6位的,且BIN和bank都有填写
        var checkResult = "";
        var _id = $("#inputId").val();
        var bin = $("#inputBin").val();
        var bank = $("input[name='binMapping[bank]']:checked").val();
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

    const promiseBin = new Promise((resolve, reject) => {
        $(".tempBinObj").bind("click", e => {
            var target = $(e.target);
            var id = target.data('id');
            var bin = target.data('bin');
            var bank = target.data('bank');
            resolve([id, bin, bank]);
        })
    }).then(([id, bin, bank]) => {
        var tr = $(".item-id-" + id);
        console.log(id)
        console.log(bin)
        console.log(bank)
        $("#delBin").bind("click", function () {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/bin/list?bin=" + bin + "&bank=" + bank
            })//删除后，服务器返回的状态
                .done(function (data) {
                    if (data.msg) {
                        if (tr.length > 0) {
                            tr.remove();
                        }
                    }
                    window.location = binlistUrl;//刷新内容
                })
        });
    }).catch(error => {
        console.log(error);
    });
    //新创建银行，则需要去数据库中查询银行是否被使用过了；
    $("#createBank").bind("click", function () {
        //确保银行名字不为空
        var checkResult = "";
        var _id = $("#inputId").val();
        var name = $("#inputName").val();
        if (name === "") {
            checkResult += "必须输入银行名字！";
        } else {
            $.ajax({
                type: "POST",
                url: bankCreateUrl,
                dataType: "JSON",
                data: {
                    bank: {
                        _id: _id,
                        name: name
                    }
                },
                success: function (data) {
                    if (data.success) {
                        window.location = banklistUrl;
                    } else {
                        checkResult = data.msg;
                    }
                    $("#checkBank").html(checkResult);
                },
                error: function (jqXHR) {
                    checkResult = "服务器异常：" + jqXHR.status;
                    $("#checkBank").html(checkResult);
                }
            })
        }
        $("#checkBank").html(checkResult);
    })

    const promiseBank = new Promise(function (resolve, reject) {
        $(".tempBank").bind("click", function (e) {
            var target = $(e.target);
            var id = target.data('id');
            resolve(id);
        })
    });
    //删除bank
    promiseBank.then(function (id) {
        var tr = $(".item-id-" + id);
        $("#delBank").bind("click", function () {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/bank/list?id=" + id
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
});
