// @ts-ignore
import {ethers} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/dist/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deployGovernanceToken: DeployFunction =
    async function(hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const {getNamedAccounts, deployments, network} = hre;
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  log('Deploying Governance Token...');
  const governanceToken = await deploy('GovernanceToken', {
    from: deployer,
    args: [],
    log: true,
    // waitConfirmations:
  });
  log(`Deployed governance token to address ${governanceToken.address}`);

  await delegate(governanceToken.address, deployer);
  log('Delegated!');
};

const delegate =
    async (governanceTokenAddress: string, delegatedAccount: string) => {
  const governanceToken =
      await ethers.getContractAt('GovernanceToken', governanceTokenAddress);
  const tx = await governanceToken.delegate(delegatedAccount);
  await tx.wait(1);
  console.log(
      `Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}


export default deployGovernanceToken;
deployGovernanceToken.tags = ['all', 'governor'];
