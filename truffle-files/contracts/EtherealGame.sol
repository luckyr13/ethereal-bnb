// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
pragma abicoder v2;

import '@openzeppelin/contracts/access/AccessControl.sol';
import "@openzeppelin/contracts/utils/Context.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import './IEtherealCharacter.sol';
import './IBEP20.sol';

contract EtherealGame is Context, AccessControl
{
  struct Player {
    bytes32 nickname;
    uint32 wins;
    uint32 loss;
    uint32 tie;
    uint32 gaveup;
  }

  struct Fight {
    address player1;
    address player2;
    uint256 player1CharacterId;
    uint256 player2CharacterId;
  }
  
  // Player role to improve access control
  bytes32 public constant PLAYER_ROLE = keccak256("PLAYER_ROLE");

  // Addresses of other contracts
  address public planetContract;
  address public characterContract;
  address public weaponsContract;
  address public kopernikTokenContract;

  // Contract status
  bool public active;
  // Table of players
  mapping(address => Player) public playerData;
  address[] public players;
  uint256 public numPlayers;
  mapping(bytes32 => bool) public playerNicknameExists;
  mapping(address => bool) public playerIsRegistered;
  
  // Table of fights
  Fight[] public fights;
  uint256 public numFights;
  // Statistics
  address public topPlayer;
  uint256 public topFighter;

  // Settings
  uint256 public initialTokens;

  /*
  * @dev Check if bytes32 is empty
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
	*	@dev Check if contract is active
	*/
	modifier isContractActive {
		require( active, "Contract is inactive" );
		_;
	}

  /*
  * @dev Check if contract is active
  */
  modifier isNotRegistered() {
    require(!playerIsRegistered[_msgSender()], "Player is already registered");
    _;
  }

  /*
  * @dev Check if planet name is available or if is already used
  */
  modifier isPlayerNicknameAvailable(bytes32 _name) {
    require(
      !playerNicknameExists[_name],
      "Nickname name already exists"
    );
    _;
  }


  /*
  * @dev Log contract status update
  */
  event ContractStatusUpdated(bool newStatus);
  event LibContractAddressUpdated(address newAddress, bytes32 contractName);
	
  /*
  * @dev Set default admin role to owner
  */
  constructor(
    address _planetAddress,
    address _characterAddress,
    address _weaponAddress,
    address _tokenAddress,
    uint256 _initialTokens
  ) {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setPlanetContractAddress(_planetAddress);
    _setCharacterContractAddress(_characterAddress);
    _setWeaponContractAddress(_weaponAddress);
    _setKopernikTokenContractAddress(_tokenAddress);
    initialTokens = _initialTokens;
    active = true;
  }

  /*
  *  @Update planet contract address
  */
  function _setPlanetContractAddress(address _contract)
    private
  {
    planetContract = _contract;
    emit LibContractAddressUpdated(_contract, 'planet');
  }

  /*
  *  @Update character contract address
  */
  function _setCharacterContractAddress(address _contract)
    private
  {
    characterContract = _contract;
    emit LibContractAddressUpdated(_contract, 'character');
  }

  /*
  *  @Update weapon contract address
  */
  function _setWeaponContractAddress(address _contract)
    private
  {
    weaponsContract = _contract;
    emit LibContractAddressUpdated(_contract, 'weapon');
  }

  /*
  *  @Update token contract address
  */
  function _setKopernikTokenContractAddress(address _contract)
    private
  {
    kopernikTokenContract = _contract;
    emit LibContractAddressUpdated(_contract, 'kopernik');
  }

  /*
  *  @dev Register a new player
  */
  function _registerPlayer(bytes32 _name)
    private
    isNotEmptyBytes32(_name)
    isNotRegistered
    isPlayerNicknameAvailable(_name)
  {
    playerData[_msgSender()] = Player(_name, 0, 0, 0, 0);
    players.push(_msgSender());
    playerNicknameExists[_name] = true;
    playerIsRegistered[_msgSender()] = true;
    numPlayers = players.length;
    _setupRole(PLAYER_ROLE, _msgSender());
  }

  /*
  * @dev Send initial tokens
  */
  function _sendInitialTokensToPlayer(address _to)
    private
  {
    IBEP20 KopernikToken = IBEP20(kopernikTokenContract);
    uint256 etherealBalance = KopernikToken.balanceOf(address(this));
    // Check contract balance
    if (etherealBalance < initialTokens) {
      revert("Not enough balance on Ethereal balance!");
    }
    if (!KopernikToken.transfer(_to, initialTokens)) {
      revert("Error transfering tokens");
    }
  }

  /*
  * @dev Create a new character
  */
  function _createCharacter(bytes32 _name)
    private
    isNotEmptyBytes32(_name)
    returns (uint256)
  {
    
    IEtherealCharacter.ElementOfNature primaryElement = IEtherealCharacter.ElementOfNature.Air;
    IEtherealCharacter.ElementOfNature secondaryElement = IEtherealCharacter.ElementOfNature.Water;
    
    IEtherealCharacter CharacterContract = IEtherealCharacter(characterContract);
    IEtherealCharacter.CharacterBaseMetadata memory extraBaseMetaData = IEtherealCharacter.CharacterBaseMetadata(
      _name, "", "", 1, 0
    );
    IEtherealCharacter.CharacterPhysicalMetadata memory extraPhysicalMetaData = IEtherealCharacter.CharacterPhysicalMetadata(
      1, 1, 1, 1, 1, 1
    );
    IEtherealCharacter.CharacterAttributesMetadata memory extraAbilitiesMetaData = IEtherealCharacter.CharacterAttributesMetadata(
      primaryElement, secondaryElement, 1, 1, 1, 1, 1, 1
    );

    uint256 characterId = CharacterContract.mint(
      _msgSender(),
      extraBaseMetaData,
      extraPhysicalMetaData,
      extraAbilitiesMetaData
    );
    return characterId;
  }

  /*
  * @dev Create a new player and send initial tokens
  */
  function registerPlayer(bytes32 _name)
    public
    isContractActive
  {
    _registerPlayer(_name);
    _sendInitialTokensToPlayer(_msgSender());
  }

  /*
  * @dev Create a new character
  */
  function createCharacter(bytes32 _name)
    public
    isContractActive
    returns(uint256)
  {
    require(hasRole(PLAYER_ROLE, _msgSender()), "activateDeactivateContract: must have player role");

    uint256 characterId = _createCharacter(_name);
    return characterId;
  }

  /*
  * @notice Update contract status
  */
  function activateDeactivateContract(bool _active)
    external
  {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "activateDeactivateContract: must have admin role");

    active = _active;
    emit ContractStatusUpdated(_active);
  }



}