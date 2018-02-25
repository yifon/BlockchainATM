var NodeContract = require('../models/nodeContract');

var atmIp;//atm节点在区块链中的ip
var atmAddress;//atm节点在区块链中的地址
var atmBank;//atm所属银行
var contractInitVars = { contractfile: "BTM", web3http: atmIp, atmAddress: atmAddress, atmBank: atmBank, contractAddress: "0x8182dd293942ff6839e6e8c8a71981bb8ad655e5" };
var contract = NodeContract.initContract(contractInitVars, checkDebitCallback, checkCreditCallbak, commitCallback);

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
    var debitBank = req.session.transaction["debitBank"];//发卡行／扣款行
    var type = req.session.transaction["type"];//交易类型决定发送给blockchain的部分数据
    //ATM<->Blockchain之间的参数传递
    var contractInput = {
        _fromAtm: atmAddress,
        _debitBank: debitBank,
        _creditBank: "",
        _trxHash: "",
        _amount: 0,
        _fee: 0,
        _status: 1000
    };
    if (type == "查询余额") {
        contractInput["_creditBank"] = "0x0";//查询余额不设计帐户金钱转移，无收款行
    }
    //传入id,从回调方法里拿到查询到的atm数据
    const p = new Promise((resolve, reject) => {
        Atm.findOne({ _id: id })
        .populate({ path: 'bank', select: 'name' })
        .exec((err, atm) => {
            atmIp = atm.ip;
            atmAddress = atm.address;
            atmBank = atm.bank.name;
            resolve();
        })
    }).then(() => {
        //ATM->Blockchain
        contract.startTrx(contractInput._fromAtm, contractInput._debitBank, contractInput._creditBank, contractInput._trxHash, parseInt(contractInput._amount), parseInt(contractInput._fee), contractInput._status);
    })
}
//CheckDebit事件监听到后的回调,原设计是需要atmc跟所属的atmp进行交互，然后收到atmp结果后，再通知blockchain去确认扣款，此处直接不与atmp交互
exports.checkDebitCallback=(contractOutput)=>{
    contract.confirmDebit(contractOutput._fromAtm, contractOutput._debitBank, contractOutput._creditBank, contractOutput._trxHash, parseInt(contractOutput._amount.toString()), parseInt(contractOutput._fee.toString()), atmpRes, {from: contractInitVars.atmAdd, gas: 0x47b760});  
}