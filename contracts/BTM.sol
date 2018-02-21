pragma solidity ^0.4.17;

contract owned {
    address public owner;

    function owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner public {
        owner = newOwner;
    }
}

contract BTM is owned{
    mapping (address => int256) private balanceOf;//cg: represent balance of each account
    mapping (address => address[]) atmsOf;//每家银行的atm
    int constant STATUS_OK = 1000;//表示成功的状态码
    function BTM(){}
    
    //通知操作ATM结束交易
    event Commit(address _fromAtm, address _debitBank, address _creditBank,  string _trxHash, int256 _amount, int256 _fee, int _status);

    //ATM->Blockchain,通知Blockchain有交易开始
    function startTrx(address _fromAtm, address _debitBank, address _creditBank,string _trxHash, int256 _amount, int256 _fee) external{
            var _debitBankAtm = getDestNode(_debitBank);//随机找一台扣款行ATM代理扣款事件
            CheckDebit( _fromAtm,  _debitBankAtm,  _debitBank, _creditBank,  _trxHash,   _amount,  _fee);    
    }

    //Blockchain->ATM,通知扣款行ATM进行扣款
    event CheckDebit(address _fromAtm, address _debitBankAtm, address _debitBank, address _creditBank,  string _trxHash, int256 _amount, int256 _fee);
    
    //ATM->Blockchain,代理扣款事件的ATM与扣款行交互完成后，通知Blockchain
    function confirmDebit(address _fromAtm, address _debitBank, address _creditBank, string _trxHash, int256 _amount, int256 _fee, int _status) external{
        //状态正常
        if (_status == STATUS_OK){
        }
        //如果状态异常则执行confirmCredit
        else {
            confirmCredit( _fromAtm,  _debitBank,  _creditBank,  _trxHash,   _amount,  _fee, false, _status);
        }
        //取款是无收款行的，所以期望creditBank为0。且只需直接执行confirmCredit
        if(_creditBank == 0x0){
            confirmCredit( _fromAtm,  _debitBank,  _creditBank,  _trxHash,   _amount,  _fee, true, _status);
        }
        //其它涉及收款的交易
        else{
            var _creditBankAtm = getDestNode(_creditBank);////随机找一台收款行ATM代理收款事件
            CheckCredit( _fromAtm,  _debitBank,  _creditBankAtm, _creditBank, _trxHash,   _amount,  _fee);
        }
    }
    //Blockchain->ATM,通知收款行ATM进行收款
    event CheckCredit(address _fromAtm, address _debitBank, address _creditBankAtm,address _creditBank,  string _trxHash, int256 _amount, int256 _fee);//the debit bank has the right to know all transaction information
    
    //ATM->Blockchain,通知Blockchain收款完成
    function confirmCredit(address _fromAtm, address _debitBank, address _creditBank,  string _trxHash, int256 _amount, int256 _fee, bool _feeFrDebitBank, int _status) public{
        if(_status == STATUS_OK){      
            balanceOf[_debitBank] -= _amount;//扣款行减账
            balanceOf[_creditBank] += _amount;//收款行加账
            if(_feeFrDebitBank){
                balanceOf[_debitBank] -= _fee;//扣款行支付手续费，如跨行取款，发卡行也即扣款行需要支付手续费给客人操作的ATM 
            }else{
                balanceOf[_creditBank] -= _fee;//收款行支付手续费，如跨行存款，发卡行也即收款行需要支付手续费给客人操作的ATM       
            }
            balanceOf[_fromAtm] += _fee;//客人操作的ATM
        }        
        //通知操作ATM交易完成
        Commit( _fromAtm,  _debitBank,  _creditBank,  _trxHash,   _amount,  _fee, _status);
    }
    
    //添加银行的ATM
    function setBankATM(address _bankAdd, address[] _atmAdd) external onlyOwner{
        atmsOf[_bankAdd] = _atmAdd;
    }

    //返回银行的ATM
    function getBankAtms(address _bankAdd) external onlyOwner view returns(address[] s){
        return atmsOf[_bankAdd];
    }

    //此处随机指定一台ATM做代理操作
    function getDestNode(address _issueBank) internal returns (address dest){
        var index = block.number % atmsOf[_issueBank].length;
        return atmsOf[_issueBank][index];
    }   
    
    //返回帐户余额
    function getBalance(address _add) external view onlyOwner returns (int256) {
        return balanceOf[_add];
    }

}