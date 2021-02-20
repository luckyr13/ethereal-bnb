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

  // Create planets 
  await planet.createPlanet(web3.utils.utf8ToHex('Earth'), web3.utils.utf8ToHex('Earth is the third planet from the Sun and the only astronomical object known to harbor life.') );
  await planet.createPlanet(web3.utils.utf8ToHex('Mars'), web3.utils.utf8ToHex('Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury.') );
  await planet.createPlanet(web3.utils.utf8ToHex('X7'), web3.utils.utf8ToHex('No data available') );
  await planet.createPlanet(web3.utils.utf8ToHex('Aetherial'), web3.utils.utf8ToHex('A very mystical planet.') );

};
