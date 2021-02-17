const EtherealCharacter = artifacts.require("EtherealCharacter");
const EtherealWeapon = artifacts.require("EtherealWeapon");
const EtherealPlanet = artifacts.require("EtherealPlanet");
const KopernikToken = artifacts.require("KopernikToken");
const EtherealGame = artifacts.require("EtherealGame");

module.exports = async (deployer) => {
  await deployer.deploy(
  	EtherealCharacter,
  	"Ethereal Character",
  	"ETHCH",
  	"https://bafzbeidekq3xo74yjxycvaa5asbiwoyevrc7timckvwym4caea52zjbmum.textile.space/character/"
  );
  await deployer.deploy(
  	EtherealWeapon,
  	"Ethereal Weapon",
  	"ETHWP",
  	"https://bafzbeidekq3xo74yjxycvaa5asbiwoyevrc7timckvwym4caea52zjbmum.textile.space/weapon/"
  );
  await deployer.deploy(EtherealPlanet);
  await deployer.deploy(KopernikToken);
  await deployer.deploy(
  	EtherealGame,
  	EtherealPlanet.address,
  	EtherealCharacter.address,
  	EtherealWeapon.address,
  	KopernikToken.address,
  	1000
  );


  // Add admin roles to Ethereal Game Contract
  const character = await EtherealCharacter.deployed();
  const weapon = await EtherealWeapon.deployed();
  const planet = await EtherealPlanet.deployed();

  character.grantRole(web3.utils.sha3('MINTER_ROLE'), EtherealGame.address);
  weapon.grantRole(web3.utils.sha3('MINTER_ROLE'), EtherealGame.address);
  planet.grantRole(web3.utils.sha3('MINTER_ROLE'), EtherealGame.address);

  // Send tokens to Ethereal Game Contract
  const account = await web3.eth.getAccounts();
  const kopernik = await KopernikToken.deployed();
  const initKoperniks = 1000000000;
  kopernik.transfer(EtherealGame.address, initKoperniks);
};
