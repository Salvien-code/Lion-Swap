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

    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "Amount should be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / _totalSupply;
        uint lionTokenAmount = (getReserve() * _amount) / _totalSupply;
        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);
        ERC20(lionTokenAddress).transfer(msg.sender, lionTokenAmount);
        return (ethAmount, lionTokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;

        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToLionToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );
        require(tokensBought >= _minTokens, "Insufficient output amount");
        ERC20(lionTokenAddress).transfer(msg.sender, tokensBought);
    }

    function lionTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "Insufficient output amount");
        ERC20(lionTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(ethBought);
    }
}
