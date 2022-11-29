import {ethers} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/dist/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

import {QUORUM_PERCENTAGE, VOTING_DELAY, VOTING_PERIOD} from '../helper-hardhat-config';


const deployGovernorContract: DeployFunction =
    async function(hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments, network} = hre;
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  const governanceToken = await ethers.getContract('GovernanceToken');
  const TimeLock = await ethers.getContract('TimeLock');
  log('Deploying Governor ...');

  const governorContract = await deploy('GovernorContract', {
    from: deployer,
    args: [
      governanceToken.address, TimeLock.address, QUORUM_PERCENTAGE,
      VOTING_PERIOD, VOTING_DELAY
    ],
    log: true
  });
  log(`GovernorContract at ${governorContract.address}`)
}

export default deployGovernorContract;
deployGovernorContract.tags = ['all', 'governor'];