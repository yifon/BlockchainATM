var NodeContract = require('../models/nodeContract');

/**
 * 在展示结果前，应该根据交易的不同类型执行blockchain交易，并返回结果，已做后续页面的渲染
 *
 * 根据_id查询atm节点的信息：
 * contractfile:合约文件名，暂时hardcode处理
 * webhttp:每个节点的ip:port地址，格式为http:xxxxxxxx:####,应从数据库中查询；
 * atmAddress：atm节点在geth上创建的帐户地址，应从数据库中获取
 * atmBank:为字符串，应从数据库中查询，再匹配nodes.json中的数据
 * contractAddress：智能合约部署地址，可从配置中读取，或从数据库中读取，暂时hardcode处理
 */
exports.execute = (req, res) => {
    var _id = req.session.atm["_id"];
    var ip;
    var address;
    var bank;
    var contractInitVars = { contractfile: "BTM", web3http: ip, atmAddress: address, atmBank: bank, contractAddress: "0x8182dd293942ff6839e6e8c8a71981bb8ad655e5" };
    var contract = NodeContract.initContract(contractInitVars, checkDebitCallback, checkCreditCallbak, commitCallback);
    //传入id,从回调方法里拿到查询到的atm数据
    Atm.findOne({ _id: id })
        .populate({ path: 'bank', select: 'name' })
        .exec((err, atm) => {
            ip = atm.ip;
            address = atm.address;
            bank = atm.bank.name;
        })
}





exports.test = (req, res) => {
    res.render('testNode', {
        bigTitle: "测试blockchain node"
    });
}
exports.startTrx = (req, res) => {
    var node = req.body.node;
    req.body.node.status = 1000;
    contract.startTrx(node._fromAtm, node._debitBank, node._creditBank, node._trxHash, parseInt(node._amount), parseInt(node._fee), node.status);
}