const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/26572f44518b42b4b1fd44ccfe9a5192"
);

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

        const signature = buildMethodSignature(f);
        const selector = web3.utils.keccak256(signature).substring(0, 10);
        console.log(`\tSignature: ${signature}`);
        console.log(`\tSelector: ${selector}`);
      }
    });
};

const buildMethodSignature = f => {
  let params = "";
  f.inputs.forEach((input, idx) => {
    if (idx > 0) {
      params = params.concat(",");
    }
    params = params.concat(input.type);
  });
  return `${f.name}(${params})`;
};
