// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultXToken is ERC20, Ownable {
    constructor() ERC20("VaultX", "VLTX") Ownable(msg.sender) {
        // Mint 1 billion tokens to the deployer
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }
}
