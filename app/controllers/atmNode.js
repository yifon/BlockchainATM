ContractNode = {
    /**
     *  初始化节点合约
     * contractfile - .abi/.bin文件前缀
     * web3http - http地址
     * add - 合约地址
     * callback - 合约初始化结束后的回调
     * authorisedCallback - the callback when authorisation completes
     */
  
    initContract: function (contractfile, web3http, add, checkDebitCallback, checkCreditCallback, commitCallback) {
      console.log("initContract");
  
      var http = require('http');
      var Web3 = require('web3');
      var fs = require('fs');
  
      web3 = new Web3(new Web3.providers.HttpProvider(web3http));//不同node端口不同
      web3.personal.unlockAccount(web3.eth.accounts[0], '', 0);
  
      fs.readFile(contractfile + ".json", 'utf8', function (err, data) {
        var json = JSON.parse(data);
        var abi = json.abi;
        var nodeContract = web3.eth.contract(abi).at(add);
  
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
  
        initCallback(nodeContract, web3);
      });
    }
  }
  
  /**
   * 测试node
   */
  
  //测试A bank的一台ATM,即其中一个节点
  var ownerBank = "0x01751f1b5a22aaee0824d68b888f2190a663d768";//A bank地址
  var atmAdd = "0xca843569e3427144cead5e4d5999a3d0ccf92b8e"; //A bank的A001
  
  //从A001发起一单交易
  //参数：(contractfile, web3http, add, checkDebitCallback, checkCreditCallback, commitCallback)
  new ContractNode.initContract("BTM", "http://localhost:7101", "0x02de28d224c23b5aeff3561fbdf7a6ef15212344",
    //checkDebitCallback
    function (contract, args) {
      //检查该ATM是否属于扣款行的ATM,只有是才需要调用confirmDebit事件
      if (args._debitBankAtm == atmAdd) {
        console.log(atmAdd + ": handling checkDebitCallback");
        //blockchain确认扣款动作
        contract.confirmDebit(args._fromAtm, args._debitBank, args._creditBank, args._trxHash, parseInt(args._amount.toString()), parseInt(args._fee.toString()), 1000, { from: web3.eth.accounts[0], gas: 0x47b760 });
      }
      //不处理
      else {
        console.log(atmAdd + ": do not need to handle checkDebitCallback");
      }
    },
    //checkCreditCallbak
    //event CheckCredit(address _fromAtm, address _debitBank, address _creditBankAtm,address _creditBank,  string _trxHash, int256 _amount, int256 _fee)
    function (contract, args) {
      //检查该ATM是否属于收款行的ATM,只有是才需要调用confirmCredit事件
      if (args._creditBankAtm == atmAdd) {
        console.log(atmAdd + ": handling checkCreditCallbak");
        //blockchain确认收款动作
        contract.confirmCredit(args._fromAtm, args._debitBank, args._creditBank, args._trxHash, parseInt(args._amount.toString()), parseInt(args._fee.toString()), 1000, { from: web3.eth.accounts[0], gas: 0x47b760 });
      }
      //不处理
      else {
        console.log(atmAdd + ": do not need to handle checkCreditCallbak");
      }
    },
    //commitCallback
    function (contract, args) {
      //通知完操作ATM结束这个交易
      if (args._fromAtm == atmAdd) {
        console.log(atmAdd + ": handling commitCallback");
      } else {
        console.log(atmAdd + ": do not need to handle commitCallback");
      }
    }
  );