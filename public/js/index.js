var enterAccUrl = "/enterAcc";
var submitAccUrl = "/submitAcc";
var submitPwdUrl="/submitPwd";

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
     * 3.在数组库中存在(卡有bin,会根据bin去blockchain找到对应的银行去查询)
     */
    $("#confirmAcc").bind("click", function () {
        var acc = $("#enterAcc").val();
        var type = /^[0-9]*[0-9]$/;//以0-9开头和结尾
        var reg = new RegExp(type);
        if (acc === "") {
            $(".input-form").toggleClass("has-error");
            $("#accChecking").html("Please input your card number!");
        } else if (!acc.match(reg)) {
            $(".input-form").toggleClass("has-error");
            $("#accChecking").html("Please input the number 0-9!");
        } else {
            $.ajax({
                type: "POST",
                url: submitAccUrl,
                dataType: 'json',
                data: {
                    customer: {
                        debitAccount: acc
                    }
                },
                success: function (data) {
                    window.location = data.msg;
                },
                error: function (jqXHR) {
                    $("#accChecking").html("Service error [" + jqXHR.status + "], please contact the bank assistance!");
                }
            })
        }
    })
    /**
     * 验证输入的密码是否有效
     * 1.必须不为空
     * 2.与数据库相同（上一个输入卡的步骤已经知道卡所属的银行了，再去对应的银行做查询）
     */
    $("#confirmPwd").bind("click", function () {
        var pwd = $("#enterPwd").val();
        if (pwd === "") {
            $(".input-form").toggleClass("has-error");
            $("#pwdChecking").html("Please input your password!");
        } else {
            $.ajax({
                type: "POST",
                url: submitPwdUrl,
                dataType: 'json',
                data: {
                    customer: {
                        password: pwd
                    }
                },
                success: function (data) {
                    window.location = data.msg;
                },
                error: function (jqXHR) {
                    $("#pwdChecking").html("Service error [" + jqXHR.status + "], please contact the bank assistance!");
                }
            })
        }
    })
    /**
     * 选择ATM页面加载前
     * 1.应该根据后台区块链状态和对外服务状态觉得该ATM是否可让客人使用
     * 若不可选用，则该对外提醒，并将ATM状态设置为不可选
     * 2.应加载ATM编号和所属银行
     */

    /**
     * 选择ATM
     * 1.未选中ATM前，确认按钮为禁用状态
     * 2.以按确认前选择的ATM为准
     */
    $("#confirmAtm").bind("click", function () {
        var pwd = $("#enterPwd").val();
        if (pwd === "") {
            $(".input-form").toggleClass("has-error");
            $("#pwdChecking").html("Please input your password!");
        } else {
            $.ajax({
                type: "POST",
                url: submitPwdUrl,
                dataType: 'json',
                data: {
                    atmNode: {
                        fromAtm: xxx,//操作ATM
                        issueBank:xxx,//ATM所属行
                    }
                },
                success: function (data) {
                    window.location = data.msg;
                },
                error: function (jqXHR) {
                    $("#").html("Service error [" + jqXHR.status + "], please contact the bank assistance!");
                }
            })
        }
    })

    /**
     * 选择交易
     * 1.此处显示的交易，是根据上一步的ATM去查看其在blockchain数据库中注册的交易而显示的
     * 2.不同的ATM注册的交易可能不同
     */
})