pragma solidity ^ 0.4.17;

contract BTM{
    mapping(address => int256) private balanceOf;//每个区块链账户的余额

    //设置区块链帐户余额 [允许合约内外调用]
    function setBalance(address blockAccount, int256 amount)external{
        balanceOf[blockAccount] = amount;
    }
    //设置区块链帐户余额,传入账户余额已经要加的数额,如200,-500... addAmount是一个带符号整数 [允许合约内外调用]
    function addBalance(address blockAccount, int256 addAmount)public{
        balanceOf[blockAccount] += addAmount;

    }
    //返回区块链帐户余额 [可在合约内外调用]
    function getBalance(address blockAccount)public view returns(int256) {
        return balanceOf[blockAccount];
    }
    //ATM->Blockchain,传入扣款账户，收款账户，数额，返回扣款结果 ［无论是存款，取款还是转帐，实际上都是两个区块链之间账户资产的转移］
    function startTransfer(address fromAccount, address toAccount, int256 amount)external returns(bool){
        bool debitResult = executeDebit(fromAccount, amount);
        bool creditResult = executeCredit(toAccount, amount);
        if (debitResult && creditResult) {
            finishTransfer(true);//交易成功
        } else {
            finishTransfer(false);//交易失败，暂且不处理失败
        }
    }

    //ATM->Blockchain,传入扣款账户，扣款数额；执行减去扣款账户数额的动作，返回扣款结果
    function executeDebit(address fromAccount, int256 amount) internal returns(bool){
        int256 beforeAmount = getBalance(fromAccount);
        addBalance(fromAccount, 0 - amount);//传入负数
        int256 afterAmount = getBalance(fromAccount);
        if (beforeAmount - afterAmount == amount) {
            return true;//扣款成功
        } else {
            return false;
        }
    }
    //ATM->Blockchain,传入收款账户，收款数额；执行增加收款账户数额的动作，返回收款结果
    function executeCredit(address toAccount, int256 amount) internal returns(bool){
        int256 beforeAmount = getBalance(toAccount);
        addBalance(toAccount, amount);//传入整数
        int256 afterAmount = getBalance(toAccount);
        if (afterAmount - beforeAmount == amount) {
            return true;//收款成功
        } else {
            return false;
        }
    }
    //Blockchain->ATM,通知操作ATM结束交易
    event finishTransfer(bool result);
}