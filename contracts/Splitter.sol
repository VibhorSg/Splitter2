pragma solidity ^ 0.4.17;

contract Splitter {

  address public owner;
  mapping(address => uint) public balances;

  event LogSplitFunds(address indexed sender, address indexed recipient1, address indexed recipient2,
                      uint amount);
  event LogWidrawFunds(address indexed recipient, uint amount);                    

  function Splitter() public { owner = msg.sender;}

  function splitFunds(address _recipient1, address _recipient2) public payable
  returns(bool) {
    require(msg.value > 0);
    if (!isRecipientsValid(_recipient1, _recipient2)) {
      revert();
    }

    uint amountHalf = msg.value / 2;
    uint remainder = msg.value % 2;

    balances[_recipient1] = amountHalf;
    balances[_recipient2] = amountHalf + remainder;

    LogSplitFunds(msg.sender, _recipient1, _recipient2, msg.value);
    return true;
  }

  function isRecipientsValid(address _recipient1,
                             address _recipient2) private view returns(bool) {
    if (_recipient1 == _recipient2)
      return false;
    if (owner == _recipient1)
      return false;
    if (owner == _recipient2)
      return false;
    if ((_recipient1 == address(0x00)) || (_recipient2 == address(0x00)))
      return false;

    return true;
  }

  function withdrawFunds() public returns(bool) {
    require(balances[msg.sender] != 0);
    LogWidrawFunds(msg.sender, balances[msg.sender]);
    msg.sender.transfer(balances[msg.sender]);
    balances[msg.sender] = 0;
    return true;
  }

  function killMe() public returns(bool) {
    require(msg.sender == owner);
    selfdestruct(owner);
    return true;
  }

  function() public {}
}