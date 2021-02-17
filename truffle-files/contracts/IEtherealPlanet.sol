// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
import './IEtherealBase.sol';

/*
* @title Create new planets for the Ethereal universe
*/
interface IEtherealPlanet is IEtherealBase
{

	function createPlanet(bytes32 _name, string memory _description) external returns (uint id);

	/*
	*	@notice Update planet status
	*/
	function activateDeactivatePlanet(uint256 _planetId, bool _active) external;

	/*
	*	@notice Update contract status
	*/
	function activateDeactivateContract(bool _active) external;

	/*
	* @notice Returns the number of active planets
	*/
	function getNumActivePlanets() external view returns (uint256);

	/*
	* @notice Returns the list of active planets
	*/
	function getPlanets() external view returns (uint256[] memory);

	/*
	* @notice Returns the list of inactive planets
	*/
	function getInactivePlanets() external view returns (uint256[] memory);

	/*
	* @notice Return true if planet is active and exists
	*/
	function getIsPlanetActive(uint256 _planetId) external view returns (bool);

	/*
	* @notice Increase by one population counter
	*/
	function increasePopulation(uint256 _planetId) external returns (uint256);

}
