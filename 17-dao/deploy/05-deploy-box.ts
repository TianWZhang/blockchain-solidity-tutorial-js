import {ethers} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/dist/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {MIN_DELAY} from '../helper-hardhat-config';

const deployBox: DeployFunction =
    async function(hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments, network} = hre;
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  log('Deploying Box ...');

  const box = await deploy(
      'Box', {from: deployer, args: [], log: true});  // box deployment object

  const timeLock = await ethers.getContract('TimeLock');
  const boxContract =
      await ethers.getContractAt('Box', box.address)  // box contract object
  const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
  await transferOwnerTx.wait(1);
  log('You have done it');
}

export default deployBox;
deployBox.tags = ['all', 'box'];