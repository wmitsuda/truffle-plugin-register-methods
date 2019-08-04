module.exports = async config => {
  console.log(config);
  console.log("*****************************");

  // TODO: validate missing contract name
  const contractName = config._[1];
  console.log(`Contract name: ${contractName}`);

  const buildDirectory = config.contracts_build_directory;
  const contractFile = `${buildDirectory}/${contractName}.json`;
  console.log(`Reading contract file: ${contractFile}`);

  const contractJson = require(contractFile);
  const { abi } = contractJson;
  // console.log(abi);

  console.log("\nGetting contract functions...");
  abi
    .filter(f => f.type === "function")
    .forEach(f => {
      if (f.constant) {
        console.log(`${f.name} => constant, skipping`);
      } else {
        console.log(`${f.name} => processing`);
      }
    });
};
