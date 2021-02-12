const KopernikToken = artifacts.require("KopernikToken");
const PlanetFactory = artifacts.require("PlanetFactory");

module.exports = function (deployer) {
  deployer.deploy(KopernikToken);
  deployer.deploy(PlanetFactory);
};
