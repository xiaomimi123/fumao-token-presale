// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApprovalRouter is Ownable {
    
    IERC20 public immutable USDT;
    address public vaultAddress;
    
    event VaultAddressSet(address indexed vaultAddress);
    event USDTTransferExecuted(address indexed from, address indexed to, uint256 amount);
    
    constructor(address _usdtAddress, address initialOwner) Ownable(initialOwner) {
        require(_usdtAddress != address(0), "Invalid USDT address");
        USDT = IERC20(_usdtAddress);
    }
    
    function setVaultAddress(address _vaultAddress) external onlyOwner {
        require(_vaultAddress != address(0), "Invalid vault address");
        vaultAddress = _vaultAddress;
        emit VaultAddressSet(_vaultAddress);
    }
    
    function transferUSDTFrom(address from, address to, uint256 amount) external {
        require(msg.sender == vaultAddress, "Only vault can call this");
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(amount > 0, "Amount must be greater than zero");
        
        require(
            USDT.transferFrom(from, to, amount),
            "USDT transfer failed"
        );
        
        emit USDTTransferExecuted(from, to, amount);
    }
    
    function getUserAllowance(address user) external view returns (uint256) {
        return USDT.allowance(user, address(this));
    }
    
    function getUSDTAddress() external view returns (address) {
        return address(USDT);
    }
}

