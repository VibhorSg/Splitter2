pragma solidity ^ 0.4.21;

contract Splitter {

  address public owner;
  bool public isRunning;
  mapping(address => uint) public balances;

  event LogSplitFunds(address indexed sender, address indexed recipient1,
                      address indexed recipient2, uint amount);
  event LogWidrawFunds(address indexed recipient, uint amount);

  constructor() public {
    owner = msg.sender;
    isRunning = true;
  }

  modifier onlyIfRunning {
    require(isRunning);
    _;
  }

  function splitFunds(address _recipient1, address _recipient2)
      onlyIfRunning public payable
      returns(bool) {
    require(msg.value > 0);
    require(isRecipientsValid(msg.sender, _recipient1, _recipient2));

    uint amountHalf = msg.value / 2;
    uint remainder = msg.value % 2;

    balances[_recipient1] = amountHalf;
    balances[_recipient2] = amountHalf;
    if (remainder > 0)
      balances[_recipient2] += remainder;

    emit LogSplitFunds(msg.sender, _recipient1, _recipient2, msg.value);
    return true;
  }

  function isRecipientsValid(address _sender, address _recipient1,
                             address _recipient2) public pure
  returns(bool) {
    if (_recipient1 == _recipient2)
      return false;
    if (_sender == _recipient1)
      return false;
    if (_sender == _recipient2)
      return false;
    if ((_recipient1 == address(0x00)) || (_recipient2 == address(0x00)))
      return false;

    return true;
  }

  function withdrawFunds() public onlyIfRunning returns(bool) {
    require(balances[msg.sender] != 0);
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;
    emit LogWidrawFunds(msg.sender, amount);
    msg.sender.transfer(amount);
    return true;
  }

  function pause() public onlyIfRunning returns(bool) {
    require(msg.sender == owner);
    isRunning = false;
  }

  function resume() public returns(bool) {
    require(msg.sender == owner);
    isRunning = true;
  }

  function() public {}
}