$(function() {
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
    })
})