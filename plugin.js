const HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(
  process.env.TRUFFLE_PLUGIN_MNEMONIC,
  "https://mainnet.infura.io/v3/26572f44518b42b4b1fd44ccfe9a5192",
  1
);

// Initialize web3 connecting directly to mainnet
const Web3 = require("web3");
const web3 = new Web3(provider);

// Initialize method registry contract
const RegistryABI = require("./abi/registry.json");
const registryAddress = "0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86";
const registryContract = new web3.eth.Contract(RegistryABI, registryAddress);

module.exports = async config => {
  // TODO: validate missing contract name
  const contractName = config._[1];
  console.log(`Contract name: ${contractName}`);

  const buildDirectory = config.contracts_build_directory;
  const contractFile = `${buildDirectory}/${contractName}.json`;
  console.log(`Reading contract file: ${contractFile}`);

  const defaultAccount = await getDefaultAccount();
  console.log(`Using ETH account for registration: ${defaultAccount}`);

  const contractJson = require(contractFile);
  const { abi } = contractJson;

  console.log("\nGetting contract functions...");
  const functions = abi.filter(f => f.type === "function");

  const registrations = [];
  for (let f of functions) {
    if (f.constant) {
      console.log(`${f.name} => constant, skipping`);
    } else {
      console.log(`${f.name} => processing`);

      const { signature, selector } = buildMethodSignature(f);
      console.log(`\tSignature: ${signature}`);
      console.log(`\tSelector: ${selector}`);

      const result = await registryContract.methods.entries(selector).call();
      if (result) {
        console.log(`\tMethod found in the registry, skipping`);
      } else {
        console.log(
          `\tMethod not found in the registry, trying to register...`
        );

        const promievent = tryToRegister(signature, defaultAccount);
        registrations.push(promievent);
      }
    }
  }

  console.log("\n****************************");
  if (registrations.length === 0) {
    console.log("No registrations where submitted");
  } else {
    console.log("Waiting for registration transactions to complete...");
    await Promise.all(registrations);
  }
  provider.engine.stop();
};

const getDefaultAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

const buildMethodSignature = f => {
  let params = "";
  f.inputs.forEach((input, idx) => {
    if (idx > 0) {
      params = params.concat(",");
    }
    params = params.concat(input.type);
  });

  const signature = `${f.name}(${params})`;
  const selector = web3.utils.keccak256(signature).substring(0, 10);

  return { signature, selector };
};

const tryToRegister = (signature, fromAccount) => {
  return registryContract.methods
    .register(signature)
    .send({ from: fromAccount })
    .on("transactionHash", txhash => {
      console.log(`\tTX: https://etherscan.io/tx/${txhash}`);
    });
};
