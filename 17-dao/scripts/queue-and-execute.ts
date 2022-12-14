import {ethers, network} from 'hardhat';

import {developmentChains, MIN_DELAY, PROPOSAL_DESCRIPTION} from '../helper-hardhat-config';
import {moveBlocks} from '../utils/move-blocks';
import {moveTime} from '../utils/move-time';

export async function queueAndExecute() {
  const args = [77];
  const box = await ethers.getContract('Box');
  const encodedFunctionCall = box.interface.encodeFunctionData('store', args);
  const descriptionHash =
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));
  const governor = await ethers.getContract('GovernorContract');
  console.log('Queueing ...');
  const queueTx = await governor.queue(
      [box.address], [0], [encodedFunctionCall], descriptionHash);
  await queueTx.wait(1);
  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log('Executing ...');
  const executeTx = await governor.execute(
      [box.address], [0], [encodedFunctionCall], descriptionHash);
  await executeTx.wait(1);

  const boxNewValue = await box.retrieve();
  console.log(`New Box value: ${boxNewValue.toString()}`);
}

queueAndExecute().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});