import {ethers} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/dist/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

import {ADDRESS_ZERO} from '../helper-hardhat-config';

const setupContracts: DeployFunction =
    async function(hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments} = hre;
  const {log} = deployments;
  const {deployer} = await getNamedAccounts();
  const timeLock = await ethers.getContract('TimeLock', deployer);
  const governor = await ethers.getContract('GovernorContract', deployer);

  log('Setting up roles ...');
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  log(`timeLock is the admin: ${
      await timeLock.hasRole(adminRole, timeLock.address)}`);
  log(`deployer is the admin: ${await timeLock.hasRole(adminRole, deployer)}`);


  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);

  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
}

export default setupContracts;
setupContracts.tags = ['all','setup'];