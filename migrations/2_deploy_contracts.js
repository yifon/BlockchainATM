//声明一个新到合约文件实例并命名为Test
var Test = artifacts.require("./Test.sol");
var ConvertLib=artifacts.require("./ConvertLib.sol");
var MetaCoin=artifacts.require("./MetaCoin.sol");

//部署合约
module.exports = deployer => {
    deployer.deploy(Test);
    deployer.deploy(ConvertLib);
    deployer.link(ConvertLib,MetaCoin);
    deployer.deploy(MetaCoin);
}
//truffle migrate --reset来强制重编译并发布所有合约