$(function () {
    //在注册ATM页面，ATM ID是唯一的，需要在填写完后blur的时候ajax验证是否存在过

    /**
     * 在ATM录入页，验证所有选项是否都有填写
     */
    // $("#atmForm").validate({
    //     errorElement: 'span',
    //     errorClass: 'help-block',

    //     rules: {
    //         atmId: "required",
    //         location: "required",
    //         supportTxns: "required",
    //         bank: "required",
    //         model: "required",
    //         vendor: "required",
    //         uploadPicture: "required"
    //     },
    //     messages: {
    //         atmId: "请输入ATM ID",
    //         location: "请输入地理位置",
    //         supportTxns: "至少选择一种支持的交易",
    //         bank: "请选择所属银行",
    //         model: "请选择机器型号",
    //         vendor: "请选择供应商",
    //         uploadPicture: "请上传图片"
    //     },
    //     //自定义错误消息放到哪里
    //     errorPlacement: function (error, element) {
    //         element.next().remove();//删除显示图标
    //         element.after('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
    //         element.closest('.form-group').append(error);//显示错误消息提示
    //     },
    //     //对未验证对元素进行处理
    //     highligt: function (element) {
    //         $(element).closest('.form-group').addClass('has-error has-feedback');
    //     },
    //     //验证通过的处理
    //     success: function (label) {
    //         var e1 = label.closest('.form-group').find('input');
    //         el.next().remove();
    //         e1.after('<span class="glyphicon glyphicon-ok form-control-feeback" aria-hidden="true"></span>');
    //         label.closest('./form-group').removeClass('has-error').addClass('has-feedback has-success');
    //         label.remove();
    //     }
    // })

})