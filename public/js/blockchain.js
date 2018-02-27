//所需路由
var atmCreateUrl = "/admin/atm";
var atmlistUrl = "/admin/atm/list";
var binCreateUrl = "/admin/bin";
var binlistUrl = "/admin/bin/list";
var bankCreateUrl = "/admin/bank";
var banklistUrl = "/admin/bank/list";
var cardCreateUrl = "/admin/card";
var cardlistUrl = "/admin/card/list";
var findAccUrl = "/admin/blockchain/findAccount";

$(function () {
    //加载侧边导航栏
    var currentUrl = window.location.pathname;//获取路径
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
    } else if (currentUrl.indexOf("card") != -1) {
        html = "<li><a href='/admin/card/list'>银行卡列表页</a></li><li><a href='/admin/card/new'>注册新银行卡</a></li>";
        $("#sideBar").append(html);
    }

    //新创建ATM，则需要去数据库中查询ATM ID是否被使用过了
    $("#createAtm").bind("click", function () {
        var checkResult = "";
        var cardBalType = /^[0-9]*$/;//以1-9开头的n位数字
        var _id = $("#inputId").val();
        var bank = $("input[type='radio']:checked").val();
        var atmId = $("#inputAtmId").val();
        var ip = $("#inputIp").val();//区块链中http地址
        var blockAccount = $("#blockAccount").val();//区块链账户地址
        var blockPassword = $("#blockPassword").val();//区块链账户密码
        var cashAccountBalance = !$("#cashAccountBalance").val().match(cardBalType) ? 0 : $("#cashAccountBalance").val();//现金账户余额
        var blockAccountBalance = !$("#blockAccountBalance").val().match(cardBalType) ? 0 : $("#blockAccountBalance").val();//区块链账户地址
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
        formData.append('atm[ip]', ip);
        formData.append('atm[cashAccountBalance]', cashAccountBalance);
        formData.append('atm[blockAccount]', blockAccount);
        formData.append('atm[blockPassword]', blockPassword);
        formData.append('atm[blockAccountBalance]', blockAccountBalance);
        formData.append('atm[location]', location);
        formData.append('atm[supportedTxns]', supportedTxns);//传的是字符串
        formData.append('atm[model]', model);
        formData.append('atm[vendor]', vendor);
        formData.append('atm[picture]', picture);
        formData.append('uploadPicture', uploadPicture);

        if (!bank || !atmId || !location || !supportedTxns || !model || !vendor || !picture && !uploadPicture || !ip || !blockAccount || !blockPassword) {
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
            if (!ip) {
                checkResult += "必须输入区块链中注册IP！";
            }
            if (!blockAccount) {
                checkResult += "必须输入区块链中注册地址！";
            }
            if (!blockPassword) {
                checkResult += "必须输入区块链账户密码！";
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

    //新创建BIN
    $("#createBin").bind("click", function () {
        //确保BIN是6位的,且BIN和bank都有填写
        var checkResult = "";
        var _id = $("#inputId").val();
        var bin = $("#inputBin").val();
        var bank = $("input[name='binMapping[bank]']:checked").val();
        var type = /^[1-9][0-9]{5}$/;//以1-9开头,0-9结尾的6位数字
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

    //新创建银行
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

    //新创建银行卡
    $("#createCard").bind("click", function () {
        $(this).attr("disabled", "true");
        var checkResult = "";
        var cardCnType = /[0-9]{10,13}$/;//以0-9开头的10-13位数字
        var cardPwdType = /[0-9]{6}$/;//以0-9开头的6位数字
        var cardBalType = /^[0-9]*$/;//以1-9开头的n位数字
        var cardId = $("#cardId").val();
        var cardBank = $("#cardBank").find("input[type='radio']:checked").val();
        var cardBin = $("#cardBin").find("option:selected").val();
        var cardCustomerNumber = $("#cardCustomerNumber").val();
        var cardName = $("#cardName").val();
        var cardPassword = $("#cardPassword").val();
        var blockPassword = $("#blockPassword").val();
        var cashAccountBalance = !$("#cashAccountBalance").val().match(cardBalType) ? 0 : $("#cashAccountBalance").val();
        var blockAccount = $("#blockAccount").val();
        var blockAccountBalance = !$("#blockAccountBalance").val().match(cardBalType) ? 0 : $("#blockAccountBalance").val();
        if (!cardBin || !cardCustomerNumber.match(cardCnType) || !cardName || !cardPassword.match(cardPwdType) || !blockPassword || !blockAccount) {
            if (!cardBin) {
                checkResult += "必须选择有注册了BIN的银行！";
            }
            if (!cardCustomerNumber.match(cardCnType)) {
                checkResult += "必须输入10位数字的客户银行卡后缀！";
            }
            if (!cardName) {
                checkResult += "必须输入客户姓名！";
            }
            if (!cardPassword.match(cardPwdType)) {
                checkResult += "必须输入6位数字的银行卡密码！";
            }
            if (!blockPassword) {
                checkResult += "必须输入区块链账户密码！";
            }
            if (!blockAccount) {
                checkResult += "必须输入区块链账户地址！";
            }

        } else {
            $.ajax({
                type: "POST",
                url: cardCreateUrl,
                dataType: "JSON",
                data: {
                    card: {
                        _id: cardId,
                        bank: cardBank,
                        bin: cardBin,
                        number: cardBin + cardCustomerNumber,
                        name: cardName,
                        password: cardPassword,
                        cashAccountBalance: cashAccountBalance,
                        blockAccount: blockAccount,
                        blockPassword: blockPassword,
                        blockAccountBalance: blockAccountBalance
                    }
                },
                success: function (data) {
                    if (data.success) {
                        window.location = cardlistUrl;
                    } else {
                        checkResult = data.msg;
                    }
                    $("#checkCard").html(checkResult);
                    $(this).attr("disabled", "false");
                },
                error: function (jqXHR) {
                    checkResult = "服务器异常：" + jqXHR.status;
                    $("#checkCard").html(checkResult);
                    $(this).attr("disabled", "false");
                }
            })
        }
        $("#checkCard").html(checkResult);
    })


    //删除atm
    const promiseAtm = new Promise((resolve, reject) => {
        $(".tempAtm").bind("click", e => {
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
        $("#delAtm").bind("click", () => {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/atm/list?atmId=" + atmId + "&bank=" + bank + "&picture=" + picture
            })//删除后，服务器返回的状态
                .done(data => {
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

    //删除bin
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
        $("#delBin").bind("click", () => {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/bin/list?_id=" + id + "&bank=" + bank
            })//删除后，服务器返回的状态
                .done(data => {
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

    //删除bank
    const promiseBank = new Promise((resolve, reject) => {
        $(".tempBank").bind("click", e => {
            var target = $(e.target);
            var id = target.data('id');
            resolve(id);
        })
    }).then((id) => {
        var tr = $(".item-id-" + id);
        $("#delBank").bind("click", () => {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/bank/list?id=" + id
            })//删除后，服务器返回的状态
                .done(data => {
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

    //删除card
    const promiseCard = new Promise((resolve, reject) => {
        $(".tempCardObj").bind("click", e => {
            var target = $(e.target);
            var id = target.data('id');
            resolve(id);
        })
    }).then((id) => {
        var tr = $(".item-id-" + id);
        $("#delCard").bind("click", () => {
            $.ajax({
                type: "DELETE",//异步请求类型为del
                url: "/admin/card/list?id=" + id
            })//删除后，服务器返回的状态
                .done(data => {
                    if (data.msg) {
                        if (tr.length > 0) {
                            tr.remove();
                        }
                    }
                    window.location = cardlistUrl;//刷新内容
                })
        });
    }).catch(error => {
        console.log(error);
    });

    //获取卡支持的bin
    $("#cardBank input[type='radio']").bind("click", (e) => {
        $("#cardBin").find("option").remove();
        $("#checkCard").empty();
        var target = $(e.target);
        var bins = target.data("bins");
        //bins="{ bin: 622202 },{ bin: 622201 }";
        var binsArr = [];
        var html = "";
        if (bins != "" || bins.indexOf(",") != -1) {
            binsArr = bins.replace(/{ bin: | }/g, "").split(",");
            $.each(binsArr, (index, bin) => {
                html += "<option name='card[bin]'>" + bin + "</option>";
            })
        } else {
            if (bins != "") {
                html += "<option name='card[bin]'>" + bins + "</option>";
            } else {
                $("#checkCard").append("该银行未注册可使用的bin，请重新选择其它银行！");
            }
        }
        $("#cardBin").append(html);
    })
    /**
     * 查看区块链账户是否存在
     */
    $("#blockAccount").blur((e) => {
        $("#checkCard").empty();
        var blockAccount = $(e.currentTarget).val();
        console.log(blockAccount);
        if (blockAccount) {
            $.ajax({
                type: "Post",
                url: findAccUrl,
                dataType: "json",
                data: {
                    blockAccount: blockAccount
                },
                success: data => {
                    console.log(data.success)
                    if (data.success) {
                        $("#createCard").attr("disabled", "false");//允许提交账户
                        
                    } else {
                        $("#checkCard").html("不存在该区块链账户");
                        $("#createCard").attr("disabled", "true");//禁止提交账户
                    }
                },
                error: jqXHR => {
                    console.log(jqXHR.status);
                }
            })
        }
    })


});
