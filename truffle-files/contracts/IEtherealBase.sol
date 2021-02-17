// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
pragma abicoder v2;

/**
 * @dev {ERC721} token, including:
 */
interface IEtherealBase {  
   /*
    * @dev Each character can have (control) 2 base elements of nature
    */
    enum ElementOfNature {
      // Elements of nature
      Air, Water, Earth, Fire,
      // Spiritual elements
      Aether,
      // Machine elements
      ElectroMetal,
      // Special elements
      Ice,
      Thunder, 
      Psychic,
      Ghost,
      DinoPower,
      Poison,
      // Ultra elements
      DivinaMagicae
    }

    /**
    * @dev Character extra metadata
    */
    struct CharacterBaseMetadata {
      bytes32 name;
      bytes24 birthdate;
      string description;
      uint256 planetId;
      uint8 genre;
    }

    struct CharacterPhysicalMetadata {
      uint24 skintone;
      uint24 haircolor;
      uint24 eyescolor;
      uint16 weight;
      uint16 height;
      uint8 bodyType;
    }

    struct CharacterAttributesMetadata {
      ElementOfNature primaryElement;
      ElementOfNature secondaryElement;
      uint8 life;
      uint8 armor;
      uint8 strength;
      uint8 speed;
      uint8 luck;
      uint8 spirit;
      uint8 level;
      uint8 extraSkillsPoints;
    }


    /**
    * @dev Character extra metadata
    */
    struct WeaponMetadata {
      bytes32 name;
      ElementOfNature strongAgainstElement;
      ElementOfNature weakAgainstElement;
      uint8 life;
      uint8 armor;
      uint8 strength;
      uint8 speed;
      uint8 luck;
      uint8 spirit;
    }

    /*
    * Planet struct
    */
    struct Planet {
      bytes32 name;
      string description;
      uint256 population;
      bool active;
    }
}