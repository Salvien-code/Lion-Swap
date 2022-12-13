// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public lionTokenAddress;

    constructor(address _LionTokenAddress) ERC20("Lion LP Token", "LLP") {
        require(
            _LionTokenAddress != address(0),
            "Token Address passed is a null address"
        );
        lionTokenAddress = _LionTokenAddress;
    }

    function getReserve() public view returns (uint) {
        return ERC20(lionTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint lionTokenReserve = getReserve();
        ERC20 lionToken = ERC20(lionTokenAddress);

        if (lionTokenReserve == 0) {
            lionToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalance - msg.value;
            uint lionTokenAmount = (msg.value * lionTokenReserve) /
                (ethReserve);

            require(
                _amount >= lionTokenAmount,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            lionToken.transferFrom(msg.sender, address(this), lionTokenAmount);
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }

        return liquidity;
    }
}
