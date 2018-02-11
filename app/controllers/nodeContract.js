module.exports = function nodeContract() {
  /**
   *  初始化节点合约
   * contractfile - .abi/.bin文件前缀
   * web3http - http地址
   * contractAdd - 合约地址
   * contractInitVars:[contractfile,web3http,contractAdd]
   * callback - 合约初始化结束后的回调
   * authorisedCallback - the callback when authorisation completes
   */

  function initContract(contractInitVars, checkDebitCallback, checkCreditCallback, commitCallback) {
    console.log("initContract");

    var http = require('http');
    var Web3 = require('web3');
    var fs = require('fs');

    web3 = new Web3(new Web3.providers.HttpProvider(contractInitVars.web3http));//不同node端口不同
    web3.personal.unlockAccount(web3.eth.accounts[0], '', 0);

    fs.readFile(contractInitVars.contractfile + ".json", 'utf8', function (err, data) {
      var json = JSON.parse(data);
      var abi = json.abi;
      var nodeContract = web3.eth.contract(abi).at(contractInitVars.contractAdd);

      //监听CheckDebit事件
      nodeContract.CheckDebit().watch(function (err, res) {
        if (!err) {
          //检查node是否需要处理扣款
          console.log("CheckDebit arrived from contract：" + res.address);
          console.log(res.args);
          checkDebitCallback(nodeContract, res.args);
        } else {
          console.log(err);
        }
      });

      //监听CheckCredit事件
      nodeContract.CheckCredit().watch(function (err, res) {
        if (!err) {
          //检查node是否需要处理收款
          console.log("CheckCredit arrived from contract：" + res.address);
          console.log(res.args);
          checkCreditCallback(nodeContract, res.args);
        } else {
          console.log(err);
        }
      });

      //监听Commit事件,完成debit和credit动作
      nodeContract.Commit().watch(function (err, res) {
        if (!err) {
          console.log("Commit arrived from contract：" + res.address);
          console.log(res.args);
          commitCallback(nodeContract, res.args);
        } else {
          console.log(err);
        }
      });
    });
    return contract;
  }
}
