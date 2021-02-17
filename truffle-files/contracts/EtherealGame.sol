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
import './IEtherealPlanet.sol';
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
    bool tie;
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
  * @dev Returns the Sum of skills points on Metadata object
  */
  function _sumSkillsPoints(CharacterAttributesMetadata memory extraAbilitiesMetaData)
    private
    pure
    returns (uint32)
  {
    uint32 res = extraAbilitiesMetaData.life.add(
      extraAbilitiesMetaData.armor.add(
        extraAbilitiesMetaData.strength
      )
    );
    res = res.add(
      extraAbilitiesMetaData.speed.add(
        extraAbilitiesMetaData.luck.add(
          extraAbilitiesMetaData.spirit
        )
      )
    );

    return res;
  }

  /*
  * @dev Create a new character
  *
  * - Only 10pts for skills (abilities) can be assigned on creation 
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
    require(_sumSkillsPoints(extraAbilitiesMetaData) == 10, "The sum of skills points must be equal to 10");
    // The planet must be valid
    require(
      IEtherealPlanet(planetContract).getIsPlanetActive(extraBaseMetaData.planetId), "Invalid planet id"
    );

    extraAbilitiesMetaData.level = 1;
    extraAbilitiesMetaData.extraSkillsPoints = 0;

    IEtherealCharacter CharacterContract = IEtherealCharacter(characterContract);
    uint256 characterId = CharacterContract.mint(
      _msgSender(),
      extraBaseMetaData,
      extraPhysicalMetaData,
      extraAbilitiesMetaData
    );
    // Increment planet population counter
    IEtherealPlanet(planetContract).increasePopulation(extraBaseMetaData.planetId);

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
        _msgSender(), _characterId, 0, false, false, true, false, false, false,
        block.timestamp + 15 minutes
      ));
    totalFightRequests[_contender] = fightRequests[_contender].length;
    NewFightRequest(_msgSender(), _contender, totalFightRequests[_contender]);
    return totalFightRequests[_contender];
  }

  /*
  * @dev Accept fight
  * Returns contender Character Id
  */
  function _acceptFight(uint256 _fightRequestId, uint256 _myCharacterId)
    private
    returns (uint256)
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
      ) >= 100, "Not enough tokens allowed to use"
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

    return fightRequests[_msgSender()][_fightRequestId].contenderCharacterId;

  }

  /*
  * @dev Probabilities of _ch1 winning against _ch2
  */
  function _probOfCh1DefeatingCh2(
    CharacterAttributesMetadata memory _ch1,
    CharacterAttributesMetadata memory _ch2
  )
    private
    pure
    returns(uint16)
  {
    uint16 probLife = (uint16(_ch1.life).mul(100)).div(uint16(_ch1.life).add(uint16(_ch2.life)));
    uint16 probArmor = (uint16(_ch1.armor).mul(100)).div(uint16(_ch1.armor).add(uint16(_ch2.armor)));
    uint16 probStrength = (uint16(_ch1.strength).mul(100)).div(uint16(_ch1.strength).add(uint16(_ch2.strength)));
    uint16 probSpeed = (uint16(_ch1.speed).mul(100)).div(uint16(_ch1.speed).add(uint16(_ch2.speed)));
    uint16 probLuck = (uint16(_ch1.luck).mul(100)).div(uint16(_ch1.luck).add(uint16(_ch2.luck)));
    uint16 probSpirit = (uint16(_ch1.spirit).mul(100)).div(uint16(_ch1.spirit).add(uint16(_ch2.spirit)));
    uint16 probLevel = (uint16(_ch1.level).mul(100)).div(uint16(_ch1.level).add(uint16(_ch2.level)));
    // Sum all probabilities
    uint16 probFinal = (
      probLife.add(probArmor).add(probStrength)
    ).div(3);
    probFinal = (probFinal.add(probSpeed).add(probLuck)).div(3);
    probFinal = (probFinal.add(probSpirit).add(probLevel)).div(3);

    return probFinal;
  }

  /*
  * @dev FIGHT!
  *   returns winner
  */
  function _fight(
    CharacterAttributesMetadata memory _ch1,
    CharacterAttributesMetadata memory _ch2,
    uint256 _myCharacterId,
    uint256 _contenderId
  )
    private
    view
    returns(uint256, uint16)
  {
    // Get elements probs from table
    uint16 probPrimaryElem1 = probabilityOfWinningAgainstElem[_ch1.primaryElement][_ch2.primaryElement];
    uint16 probPrimaryElem2 = probabilityOfWinningAgainstElem[_ch1.primaryElement][_ch2.secondaryElement];
    uint16 probSecondaryElem1 = probabilityOfWinningAgainstElem[_ch1.secondaryElement][_ch2.primaryElement];
    uint16 probSecondaryElem2 = probabilityOfWinningAgainstElem[_ch1.secondaryElement][_ch2.secondaryElement];
  
    // Sum abilities probabilitites
    uint16 probFinal = _probOfCh1DefeatingCh2(_ch1, _ch2);
    
    // Add probabilities from Elements of Nature
    probFinal = (
      probFinal.add(probPrimaryElem1).add(probPrimaryElem2)
    ).div(3);
    probFinal = (
      probFinal.add(probSecondaryElem1).add(probSecondaryElem2)
    ).div(3);

    // Possible results
    /*
    * NOTE: Probably a PRNG would be more fun, but we need an Oracle!
    */
    if (probFinal >= 60) {
      return (_myCharacterId, probFinal);
    } else if (probFinal < 50) {
      return (_contenderId, probFinal);
    }

    // Default (draw)
    return (0, probFinal);
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
  * @dev Accept request and FIGHT!
  * returns Winner
  */
  function acceptFight(
    uint256 _fightRequestId, uint256 _myCharacterId
  )
    public
    isContractActive
    returns (uint256, uint8)
  {
    require(hasRole(PLAYER_ROLE, _msgSender()), "acceptFight: must have player role");
    // ACCEPT FIGHT
    uint256 _contenderCharacterId = _acceptFight(_fightRequestId, _myCharacterId);

    // FIGHT
    uint256 winner;
    uint16 prob;
    uint8 newLevel;
    CharacterAttributesMetadata memory _ch1 = IEtherealCharacter(characterContract).characterAttributesMetadata(_myCharacterId);
    CharacterAttributesMetadata memory _ch2 = IEtherealCharacter(characterContract).characterAttributesMetadata(_contenderCharacterId);
    (winner, prob) = _fight(_ch1, _ch2, _myCharacterId, _contenderCharacterId);


    // IF PLAYER 1 WINS (IF I WIN)
    if (winner == _myCharacterId) {
      // Upgrade Fight request status and winner
      newLevel = IEtherealCharacter(characterContract).upgradeCharacter(_myCharacterId, 6);
      fightRequests[_msgSender()][_fightRequestId].win = true;

      // Send 1 KopernikToken to winner from loser
      IBEP20(kopernikTokenContract).transferFrom(
        //Sender
        fightRequests[_msgSender()][_fightRequestId].contender,
        // Recipient
        _msgSender(),
        // Amount
        100  
      );

    } // TIE
    else if(winner == 0) {
      // Upgrade Fight request status
      fightRequests[_msgSender()][_fightRequestId].tie = true;

    } // ELSE PLAYER 2 WINS
    else {
      // Upgrade Fight request status and winner
      newLevel = IEtherealCharacter(characterContract).upgradeCharacter(_contenderCharacterId, 4);
      fightRequests[_msgSender()][_fightRequestId].loss = true;

      // Send 1 KopernikToken to winner from loser
      // Send 1 KopernikToken to winner from loser
      IBEP20(kopernikTokenContract).transferFrom(
        //Sender
        _msgSender(),
        // Recipient
        fightRequests[_msgSender()][_fightRequestId].contender,
        // Amount
        100  
      );
    }

    return (winner, newLevel);

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