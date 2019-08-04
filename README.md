# Overview

This plugins allows truffle to scan your contract build artifacts for non-constant methods and register them in the Parity Signature Registry smart contract.

By doing this, web3 browsers can use this information to show some user friendly info to the user when calling contract methods.

Currently Metamask uses this registry as explained in https://metamask.github.io/metamask-docs/Best_Practices/Registering_Function_Names, but there is too much friction. This plugin aims to incentivize people to start registering their contract functions.

Usage:

```
npx truffle run register-methods <contract-name>
```
