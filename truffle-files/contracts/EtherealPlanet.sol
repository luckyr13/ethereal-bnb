// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import "@openzeppelin/contracts/utils/Context.sol";
import './IEtherealBase.sol';

/*
* @title Create new planets for the Ethereal universe
*/
contract EtherealPlanet is Context, AccessControl, IEtherealBase
{
	using SafeMath for uint256;

	// Player role to improve access control
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	// Planet's info
	mapping(uint256 => Planet) public planets;
	// Table to store if planet's name alreay exists
	mapping(bytes32 => bool) public planetNameExists;

	// Total number of planets
	uint256 public totalNumPlanets;
	// Total number of inactive planets
	uint256 public totalInactivePlanets;
	// Contract status
	bool public active;

	// Planet population
	mapping(uint256 => uint256) public planetPopulation;

	/*
	*	@dev Check if bytes32 is empty
	*/
	modifier isNotEmptyBytes32(bytes32 _s)
	{
		require(
			(keccak256(abi.encode(_s)) != keccak256(abi.encode(""))) &&
			(keccak256(abi.encode(_s)) != keccak256(abi.encode(0x00))),
			"Empty string not allowed"
		);
		_;
	}

	/*
	*	@dev Check if planet name is available or if is already used
	*/
	modifier isPlanetNameAvailable(bytes32 _name) {
		require(
			!planetNameExists[_name],
			"Planet name already exists"
		);
		_;
	}

	/*
	*	@dev Check if planet is active
	*/
	modifier isPlanetActive(uint256 _planetId) {
		require( planets[_planetId].active, "Planet is inactive" );
		_;
	}

	/*
	*	@dev Check if contract is active
	*/
	modifier isContractActive {
		require( active, "Contract is inactive" );
		_;
	}

	/*
	* @dev Log new planet creation
	*/
	event NewPlanetCreated(uint256 indexed planetId, bytes32 name);
	/*
	* @dev Log planet status update
	*/
	event PlanetStatusUpdated(uint256 indexed planetId, bool newStatus);
	/*
	* @dev Log contract status update
	*/
	event ContractStatusUpdated(bool newStatus);
	/*
	* @dev A New character has born in this planet
	*/
	event PlanetPopulationIncreased(uint256 indexed planetId, uint256 population);


	/*
	* @dev Set default admin role to owner
	*/
	constructor() {
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		active = true;
	}


	/*
	*	@notice Create a new planet
	*/
	function createPlanet(
		bytes32 _name,
		string memory _description
	) 
		external
		isContractActive
		isNotEmptyBytes32(_name)
		isPlanetNameAvailable(_name)
		returns (uint id)
	{
		require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "createPlanet: must have admin role");
		uint256 planetId = totalNumPlanets;
		planets[planetId] = Planet(_name, _description, 0, true);
		totalNumPlanets = totalNumPlanets.add(1);
		planetNameExists[_name] = true;
		emit NewPlanetCreated(planetId, _name);
		return planetId;
	}

	/*
	*	@notice Update planet status
	*/
	function activateDeactivatePlanet(uint256 _planetId, bool _active)
		external
		isContractActive
	{
		require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "activateDeactivatePlanet: must have admin role");
		// Planet must exist
		require(
			planetNameExists[planets[_planetId].name],
			"Planet doesn't exist"
		);

		planets[_planetId].active = _active;
		if (_active) {
			totalInactivePlanets = totalInactivePlanets.sub(1);
		} else {
			totalInactivePlanets = totalInactivePlanets.add(1);
		}
		emit PlanetStatusUpdated(_planetId, _active);
	}

	/*
	*	@notice Update contract status
	*/
	function activateDeactivateContract(bool _active)
		external
	{
		require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "activateDeactivateContract: must have admin role");

		active = _active;
		emit ContractStatusUpdated(_active);
	}

	/*
	* @notice Returns the number of active planets
	*/
	function getNumActivePlanets()
		external
		view
		isContractActive
		returns (uint256)
	{
		uint256 total = totalNumPlanets.sub(totalInactivePlanets);
		return total;
	}

	/*
	* @notice Returns the list of active planets
	*/
	function getPlanets()
		external
		view
		isContractActive
		returns (uint256[] memory)
	{
		uint256 totalActive = this.getNumActivePlanets();
		uint256[] memory planetList = new uint256[](totalActive);
		uint256 counter = 0;

		for (uint256 i = 0; i < totalNumPlanets; i = i.add(1)) {
			if (planets[i].active && counter < totalActive) {
				planetList[counter] = i;
				counter = counter.add(1);
			} else if (counter >= totalActive) {
				break;
			}
		}

		return planetList;
	}

	/*
	* @notice Returns the list of inactive planets
	*/
	function getInactivePlanets()
		external
		view
		isContractActive
		returns (uint256[] memory)
	{
		uint256[] memory planetList = new uint256[](totalInactivePlanets);
		uint256 counter = 0;

		for (uint256 i = 0; i < totalNumPlanets; i = i.add(1)) {
			if (planets[i].active && counter < totalInactivePlanets) {
				planetList[counter] = i;
				counter = counter.add(1);
			} else if (counter >= totalInactivePlanets) {
				break;
			}
		}

		return planetList;
	}

	/*
	* @notice Return true if planet is active and exists
	*/
	function getIsPlanetActive(uint256 _planetId)
		external
		view
		isContractActive
		returns (bool)
	{
		bool planetStatus = planets[_planetId].active;
		return planetStatus;
	}

	/*
	* @notice Increase by one population counter
	*/
	function increasePopulation(uint256 _planetId)
		external 
		isContractActive
		isPlanetActive(_planetId)
		returns (uint256)
	{
		require(hasRole(MINTER_ROLE, _msgSender()), "increasePopulation: must have minter role");
		planetPopulation[_planetId] = planetPopulation[_planetId].add(1);
		emit PlanetPopulationIncreased(_planetId, planetPopulation[_planetId]);
		return planetPopulation[_planetId];
	}


}
