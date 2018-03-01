//所需路由
var enterAccUrl = "/enterAcc";
var submitAccUrl = "/submitAcc";
var confirmAtmUrl = "/confirmAtm";
var confirmTxnUrl = "/confirmTxn";
var confirmCwdUrl = "/confirmCwd";

$(function () {
    /**
     * 开始交易
     */
    $("#startTxn").bind("click", function () {
        window.location.href = enterAccUrl;//输入卡号
    });
    /**
     * 验证输入的卡号是否有效
     * 1.必须不为空
     * 2.必须为数字
     * 3.在数组库中存在
     */
    $("#confirmAcc").bind("click", function () {
        var acc = $("#enterAcc").val();
        var pwd = $("#enterPwd").val();
        var type = /^[0-9]*[0-9]$/;//以0-9开头和结尾
        var reg = new RegExp(type);
        var html = "";
        if (acc === "" || !acc.match(reg) || pwd === "" || !pwd.match(reg)) {
            if (acc === "" || !acc.match(reg)) {
                $(".input-form").toggleClass("has-error");
                html += "请输入银行卡号（0-9）!"
            }
            if (pwd === "" || !pwd.match(reg)) {
                $(".input-form").toggleClass("has-error");
                html += "请输入密码（0-9）!"
            }
            $("#accChecking").html(html);
        } else {
            $.ajax({
                type: "POST",
                url: submitAccUrl,
                dataType: 'json',
                data: {
                    customer: {
                        debitAccount: acc,
                        password: pwd
                    }
                },
                success: function (data) {
                    if (data.success) {
                        window.location = data.msg;
                    } else {
                        html = data.msg;
                    }
                    $("#accChecking").html(html);
                },
                error: function (jqXHR) {
                    html = "服务异常：[" + jqXHR.status + "], 请联系银行管理员";
                    $("#accChecking").html(html);
                }
            })
        }
    })

    /**
     * 选择ATM
     * 1.未选中ATM前，确认按钮为禁用状态
     * 2.以按确认前选择的ATM为准
     */
    $(".confirmAtm").bind("click", e => {
        $(".confirmAtm").attr("disabled", "true");
        var target = $(e.currentTarget);//监听注册了事件监听器的div对象
        var atmId = target.data('atmid');
        var supportedTxns = target.data('supportedtxns');//使用小写
        var _id = target.data('id');
        $.ajax({
            type: "POST",
            url: confirmAtmUrl,
            dataType: 'json',
            data: {
                atmId: atmId,//操作ATM
                supportedTxns: supportedTxns,//支持的交易
                _id: _id//ATM所属行
            },
            success: function (data) {
                if (data.success) {
                    window.location = data.msg;
                }
                console.log(data.success + "," + data.msg);
            },
            error: function (jqXHR) {
                $(".confirmAtm").attr("disabled", "false");
                console.log(jqXHR.status);
            }
        })
    })

    /**
     * 选择交易
     * 1.此处显示的交易，是根据上一步的ATM去查看其在blockchain数据库中注册的交易而显示的
     * 2.不同的ATM注册的交易可能不同
     */
    $(".confirmTxn").bind("click", e => {
        $(".confirmTxn").attr("disabled", "true");
        var type = $(e.currentTarget).html();
        $.ajax({
            type: "POST",
            url: confirmTxnUrl,
            dataType: 'json',
            data: {
                type: type//交易类型
            },
            success: data => {
                if (data.success) {
                    window.location = data.msg;
                }
                console.log(data.success + "," + data.msg);
            },
            error: jqXHR => {
                $(".confirmTxn").attr("disabled", "false");
                console.log(jqXHR.status);
            }
        })
    })

    /**
 * 验证输入的数额
 * 1.必须不为空
 * 2.必须为数字
 * 3.账户中存在足够的钱
 */
    $("#confirmCwd").bind("click", function () {
        $(this).attr("disabled", "true");
        var amt = $("#enterAmt").val();
        var type = /^[0-9]*[0-9]$/;//以0-9开头和结尾
        var reg = new RegExp(type);
        var html = "";
        if (amt === "" || !amt.match(reg)) {
            html += "请输入取款数额（0-9）!"
            $("#amtChecking").html(html);
        } else {
            $("#amtChecking").html("交易正在进行中，请耐心等待....");
            $.ajax({
                type: "POST",
                url: confirmCwdUrl,
                dataType: 'json',
                data: {
                    amount: amt
                },
                success: function (data) {
                    if (data.success) {
                        window.location = data.msg;
                    } else {
                        html += data.msg
                        $("#amtChecking").html(html);
                    }
                    $(this).attr("disabled", "false");
                },
                error: function (jqXHR) {
                    $(this).attr("disabled", "false");
                    html = "服务异常：[" + jqXHR.status + "], 请联系银行管理员";
                    $("#amtChecking").html(html);
                }
            })
        }
    })

    //
    $("#takeCard").bind("click", () => {
        window.location = "/";
    })
})