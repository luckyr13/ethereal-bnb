// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
pragma abicoder v2;

import '@openzeppelin/contracts/access/AccessControl.sol';
import "@openzeppelin/contracts/utils/Context.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import './SafeMath8.sol';
import './SafeMath16.sol';
import './SafeMath24.sol';
import './SafeMath32.sol';
import './IEtherealBase.sol';
import './IEtherealCharacter.sol';
import './IBEP20.sol';

contract EtherealGame is Context, AccessControl, IEtherealBase
{
  using SafeMath for uint256;
  using SafeMath8 for uint8;
  using SafeMath16 for uint16;
  using SafeMath24 for uint24;
  using SafeMath32 for uint32;

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

  struct FightRequest {
    address contender;
    uint256 contenderCharacterId;
    uint256 myCharacterId;
    bool accepted;
    bool rejected;
    bool pending;
    bool win;
    bool loss;
    uint256 expirationDate;
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
  
  // Table of fight requests
  mapping(address => FightRequest[]) public fightRequests;
  mapping(address => uint256) public totalFightRequests;

  // Table for Elements of nature probs
  mapping(ElementOfNature => mapping(ElementOfNature => uint8)) public probabilityOfWinningAgainstElem;

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
  event ContractStatusUpdate(bool newStatus);
  event LibContractAddressUpdate(address newAddress, bytes32 contractName);
  event ProbabilityOfWinningUpdate(ElementOfNature indexed _me, ElementOfNature _enemy, uint8 _prob);
  event NewPlayerRegistered(address indexed player, bytes32 name, uint256 totalPlayers);
  event NewCharacterMinted(address indexed player, bytes32 name);
  event NewFightRequest(address indexed player1, address indexed player2, uint256 id);
  event NewFightRequestAccepted(address indexed player1, address indexed player2);

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
    emit LibContractAddressUpdate(_contract, 'planet');
  }

  /*
  *  @Update character contract address
  */
  function _setCharacterContractAddress(address _contract)
    private
  {
    characterContract = _contract;
    emit LibContractAddressUpdate(_contract, 'character');
  }

  /*
  *  @Update weapon contract address
  */
  function _setWeaponContractAddress(address _contract)
    private
  {
    weaponsContract = _contract;
    emit LibContractAddressUpdate(_contract, 'weapon');
  }

  /*
  *  @Update token contract address
  */
  function _setKopernikTokenContractAddress(address _contract)
    private
  {
    kopernikTokenContract = _contract;
    emit LibContractAddressUpdate(_contract, 'kopernik');
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
    emit NewPlayerRegistered(_msgSender(), _name, numPlayers);
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
      revert("Not enough balance on EtherealGame contract!");
    }
    if (!KopernikToken.transfer(_to, initialTokens)) {
      revert("Error transfering tokens");
    }
  }

  /*
  * @dev Create a new character
  *
  * CharacterBaseMetadata {
  *    bytes32 name;
  *    bytes24 birthdate;
  *    string description;
  *    uint256 planetId;
  *    uint8 genre;
  *  }
  *
  */
  function _createCharacter(
    // BaseMetadata
    CharacterBaseMetadata memory extraBaseMetaData,
    // PhysicalMetadata
    CharacterPhysicalMetadata memory extraPhysicalMetaData,
    // AttributesMetadata
    CharacterAttributesMetadata memory extraAbilitiesMetaData
  )
    private
    returns (uint256)
  {
    IEtherealCharacter CharacterContract = IEtherealCharacter(characterContract);
    uint256 characterId = CharacterContract.mint(
      _msgSender(),
      extraBaseMetaData,
      extraPhysicalMetaData,
      extraAbilitiesMetaData
    );
    emit NewCharacterMinted(_msgSender(), extraBaseMetaData.name);
    return characterId;
  }

  

  /*
  * @dev Assign/update probability of my _element defeating _enemy
  */
  function _assignProbabilityOfWinning(
    ElementOfNature _me,
    ElementOfNature _enemy,
    uint8 _probWin
  )
    private
  {
    require (_probWin <= 100, "Probability must be between 0 and 100");
    uint8 probLoss = 100 - _probWin;
    probabilityOfWinningAgainstElem[_me][_enemy] = _probWin;
    emit ProbabilityOfWinningUpdate(_me, _enemy, _probWin);
    probabilityOfWinningAgainstElem[_enemy][_me] = probLoss;
    emit ProbabilityOfWinningUpdate(_enemy, _me, probLoss);
  }

  /*
  * @dev Request fight
  */
  function _requestFight(address _contender, uint256 _characterId)
    private
    returns(uint256)
  {
    require(
      IBEP20(kopernikTokenContract).allowance(
        _msgSender(), address(this)
      ) >= 1, "Not enough tokens allowed to use"
    );
    require(
      IEtherealCharacter(characterContract).ownerOf(_characterId) == _msgSender(),
      "Sender is not the owner of the character"
    );

    // Initialize as true only the "pending" flag
    fightRequests[_contender].push(FightRequest(
        _msgSender(), _characterId, 0, false, false, true, false, false,
        block.timestamp + 15 minutes
      ));
    totalFightRequests[_contender] = fightRequests[_contender].length;
    NewFightRequest(_msgSender(), _contender, totalFightRequests[_contender]);
    return totalFightRequests[_contender];
  }

  /*
  * @dev Accept fight
  */
  function _acceptFight(uint256 _fightRequestId, uint256 _myCharacterId)
    private
  {
    require(
      _fightRequestId < totalFightRequests[_msgSender()],
      "Fight index beyond array elements"
    );
    require(
      fightRequests[_msgSender()][_fightRequestId].expirationDate < block.timestamp,
      "Invitation has expired!"
    );
    require(
      fightRequests[_msgSender()][_fightRequestId].pending,
      "Invitation was already acceted/rejected"
    );
    require(
      IBEP20(kopernikTokenContract).allowance(
        _msgSender(), address(this)
      ) >= 1, "Not enough tokens allowed to use"
    );
    require(
      IBEP20(kopernikTokenContract).allowance(
        fightRequests[_msgSender()][_fightRequestId].contender, address(this)
      ) >= 1, "Not enough tokens allowed to use"
    );
    require(
      IEtherealCharacter(characterContract).ownerOf(_myCharacterId) == _msgSender(),
      "Sender is not the owner of the character"
    );

    // Update status of Fight Request log
    fightRequests[_msgSender()][_fightRequestId].accepted = true;
    fightRequests[_msgSender()][_fightRequestId].pending = false;
    fightRequests[_msgSender()][_fightRequestId].myCharacterId = _myCharacterId;
    NewFightRequestAccepted(
      _msgSender(), 
      fightRequests[_msgSender()][_fightRequestId].contender
    );

    // FIGHT
    uint256 winner;
    uint8 prob;
    (winner, prob) = _fight(_myCharacterId, fightRequests[_msgSender()][_fightRequestId].contenderCharacterId);

    // IF PLAYER 1 WINS (IF I WIN)
    if (winner == _myCharacterId) {

    } else {

    }
  }


  /*
  * @dev FIGHT!
  *   returns winner
  */
  function _fight(
    uint256 _character1Id,
    uint256 _character2Id
  )
    private
    view
    returns(uint256, uint8)
  {
    CharacterAttributesMetadata memory _ch1 = IEtherealCharacter(characterContract).characterAttributesMetadata(_character1Id);
    ElementOfNature p1_primaryElement = _ch1.primaryElement;
    ElementOfNature p1_secondaryElement = _ch1.secondaryElement;
    uint8 p1_life = _ch1.life;
    uint8 p1_armor = _ch1.armor;
    uint8 p1_strength = _ch1.strength;
    uint8 p1_speed = _ch1.speed;
    uint8 p1_luck = _ch1.luck;
    uint8 p1_spirit = _ch1.spirit;

    CharacterAttributesMetadata memory _ch2 = IEtherealCharacter(characterContract).characterAttributesMetadata(_character2Id);
    ElementOfNature p2_primaryElement = _ch2.primaryElement;
    ElementOfNature p2_secondaryElement = _ch2.secondaryElement;
    uint8 p2_life = _ch2.life;
    uint8 p2_armor = _ch2.armor;
    uint8 p2_strength = _ch2.strength;
    uint8 p2_speed = _ch2.speed;
    uint8 p2_luck = _ch2.luck;
    uint8 p2_spirit = _ch2.spirit;

    uint8 probPrimaryElem1 = probabilityOfWinningAgainstElem[p1_primaryElement][p2_primaryElement];
    uint8 probPrimaryElem2 = probabilityOfWinningAgainstElem[p1_primaryElement][p2_secondaryElement];
    
    uint8 probSecondaryElem1 = probabilityOfWinningAgainstElem[p1_secondaryElement][p2_primaryElement];
    uint8 probSecondaryElem2 = probabilityOfWinningAgainstElem[p1_secondaryElement][p2_secondaryElement];
    
    uint8 probFinalElements = (
      probPrimaryElem1.add(probPrimaryElem2).add(probSecondaryElem1).add(probSecondaryElem2)
    ).div(4);

    uint8 probLife = p1_life > p2_life ? 100 : 0;
    uint8 probArmor = p1_armor > p2_armor ? 100 : 0;
    uint8 probStrength = p1_strength > p2_strength ? 100 : 0;
    uint8 probSpeed = p1_speed > p2_speed ? 100 : 0;
    uint8 probLuck = p1_luck > p2_luck ? 100 : 0;
    uint8 probSpirit = p1_spirit > p2_spirit ? 100 : 0;
    uint8 probFinal = (
      probLife.add(probArmor).add(probStrength).add(probSpeed).add(probLuck).add(probSpirit).add(probFinalElements)
    ).div(7);

    uint256 winner = 0;
    probFinal = probFinal % 100;

    if (probFinal >= 49 && probFinal <= 51) {
      winner = 0;
    } else if (probFinal > 51) {
      winner = _character1Id;
    } else {
      winner = _character2Id;
    }

    return (winner, probFinal);
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
  function createCharacter(
    // BaseMetadata
    CharacterBaseMetadata memory extraBaseMetaData,
    // PhysicalMetadata
    CharacterPhysicalMetadata memory extraPhysicalMetaData,
    // AttributesMetadata
    CharacterAttributesMetadata memory extraAbilitiesMetaData
  )
    public
    isContractActive
    returns(uint256)
  {
    require(hasRole(PLAYER_ROLE, _msgSender()), "createCharacter: must have player role");

    uint256 characterId = _createCharacter(
      extraBaseMetaData,
      extraPhysicalMetaData,
      extraAbilitiesMetaData
    );
    return characterId;
  }

  /*
  * @dev Request a fight
  */
  function requestFight(
    address _contender,
    uint256 _characterId
  )
    public
    isContractActive
    returns(uint256)
  {
    require(hasRole(PLAYER_ROLE, _msgSender()), "requestFight: must have player role");
    uint256 fightId = _requestFight(_contender, _characterId);
    return fightId;
  }

  /*
  * @dev Assign/update probability of my _element defeating _enemy
  */
  function assignProbabilityOfWinning(
    ElementOfNature _me,
    ElementOfNature _enemy,
    uint8 _probWin
  )
    external
  {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "assignProbabilityOfWinning: must have admin role");
    _assignProbabilityOfWinning(_me, _enemy, _probWin);
  }

  /*
  * @dev Update contract status
  */
  function activateDeactivateContract(bool _active)
    external
  {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "activateDeactivateContract: must have admin role");

    active = _active;
    emit ContractStatusUpdate(_active);
  }



}