import '@typechain/hardhat'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-gas-reporter'
import 'dotenv/config'
import 'solidity-coverage'
import 'hardhat-deploy'
import {HardhatUserConfig} from 'hardhat/config'


const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {chainId: 31337, allowUnlimitedContractSize: true},
    localhost: {chainId: 31337, allowUnlimitedContractSize: true}
  },
  solidity: '0.8.17',
  namedAccounts: {deployer: {default: 0}}
}

export default config;