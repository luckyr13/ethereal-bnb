// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;
pragma abicoder v2;
import './IEtherealBase.sol';

/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *  - token ID and URI autogeneration
 *  - includes extra properties to store important metadata
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 */
interface IEtherealCharacter is IEtherealBase {
    /**
    * @dev Character extra metadata tables
    */
    function characterBaseMetadata(uint256 _tokenId) external view returns(CharacterBaseMetadata memory);
    function characterPhysicalMetadata(uint256 _tokenId) external view returns(CharacterPhysicalMetadata memory);
    function characterAttributesMetadata(uint256 _tokenId) external view returns(CharacterAttributesMetadata memory);
    function characterNameExists(uint256 _tokenId) external view returns(bool);
    
    /**
     * @dev External function to set the base URI for all token IDs. 
     */
    function setBaseURI(string memory _baseURI) external;

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(
      address to,
      CharacterBaseMetadata memory extraBaseMetaData,
      CharacterPhysicalMetadata memory extraPhysicalMetaData,
      CharacterAttributesMetadata memory extraAbilitiesMetaData
    )
        external
        returns (uint256);

    /**
     * @dev Burns `tokenId`. See {ERC721-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burn(uint256 tokenId) external;

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() external;

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() external;

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) external returns (address);

    /*
    * @dev Upgrade character level and increase skills points
    */
    function upgradeCharacter(uint256 _tokenId, uint8 _skillsPointsEarned) external returns (uint8);

}