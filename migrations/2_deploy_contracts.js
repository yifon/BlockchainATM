//声明一个新到合约文件实例并命名为Test
var Btm = artifacts.require("./BTM.sol");

//部署合约
module.exports = deployer => {
    deployer.deploy(Btm);
}
//truffle migrate --reset来强制重编译并发布所有合约