var startTrx = "/startTrx";
var confirmDebit = "/confirmDebit";
var confirmCredit="/confirmCredit";

$(function () {
    /**
     * 开始交易
     */
    $("#startTrx").bind("click", function () {
        $.ajax({
            type: "POST",
            url: startTrx,
            dataType: "JSON",
            data: {

            },
            success: function (data) {
                if (data.success) {
                    //window.location = banklistUrl;
                } else {
                    checkResult = data.msg;
                }
               // $("").html(checkResult);
            },
            error: function (jqXHR) {
                checkResult = "服务器异常：" + jqXHR.status;
               // $("#checkBank").html(checkResult);
            }
        })
    });
    
})