var NodeContract = require('./nodeContract');
exports.test = (req, res) => {
    res.render('testNode', {
        bigTitle: "测试blockchain node"
    });
}
var contract = NodeContract.initContract(contractInitVars, checkDebitCallback, checkCreditCallbak, commitCallback);
exports.startTrx = (req, res) => {
    var node = req.body.node;
    req.body.node.status = 1000;
    contract.startTrx(node._fromAtm, node._debitBank, node._creditBank, node._trxHash, parseInt(node._amount), parseInt(node._fee), node.status);
}