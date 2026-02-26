const hre = require("hardhat");

async function main() {
  const MedicineTrace = await hre.ethers.getContractFactory("MedicineTrace");
  const contract = await MedicineTrace.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
