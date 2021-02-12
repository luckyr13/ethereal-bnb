// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
import '@openzeppelin/contracts/access/Ownable.sol';

contract EtherealGame
{
	// Contract status
	bool private active;

	/*
	*	Contract must be active in order to work :)
	*/
	modifier contractMustBeActive() {
		require(active, 'Contract is inactive');
		_;
	}

	



}