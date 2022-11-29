import * as fs from 'fs';
import {ethers, network} from 'hardhat';

import {developmentChains, proposalFile, VOTING_PERIOD} from '../helper-hardhat-config'
import {moveBlocks} from '../utils/move-blocks';

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalFile, 'utf-8'));
  const proposalId = proposals[network.config.chainId!][proposalIndex];

  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1;
  const governor = await ethers.getContract('GovernorContract');
  const reason = 'I like a do da cha cha';
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  await voteTx.wait(1);
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
  console.log('Voted! Ready to go!');
}


main(0).then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});