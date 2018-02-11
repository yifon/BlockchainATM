var startTrx = "/startTrx";
var confirmDebit = "/confirmDebit";
var confirmCredit = "/confirmCredit";

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
                node: {
                    _fromAtm: "",
                    _debitBank: "",
                    _creditBank: "",
                    _trxHash: "",
                    _amount: "",
                    _fee: ""
                },
                //下述数据应该在blockchain后台注册生成，并保存在数据库中，再由前台在选取atm时去获取
                contractInitVars: {
                    contractfile: "BTM",
                    web3http: "http://localhost:7101",
                    atmAdd: "0xca843569e3427144cead5e4d5999a3d0ccf92b8e",
                    ownerBank: "0x01751f1b5a22aaee0824d68b888f2190a663d768",
                    contractAdd: "0x8182dd293942ff6839e6e8c8a71981bb8ad655e5"
                }
            },
            success: function (data) {
                checkResult = data.msg;
                $("#blockchainResult").html(checkResult);
            },
            error: function (jqXHR) {
                checkResult = "服务器异常：" + jqXHR.status;
                $("#blockchainResult").html(checkResult);
            }
        })
    });

})