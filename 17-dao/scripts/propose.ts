import * as fs from 'fs';
import {ethers, network} from 'hardhat';

import {developmentChains, PROPOSAL_DESCRIPTION, proposalFile, VOTING_DELAY} from '../helper-hardhat-config';
import {moveBlocks} from '../utils/move-blocks';

export async function propose(
    args: any[], functionTocCall: string, proposalDescription: string) {
  const governor = await ethers.getContract('GovernorContract');
  const box = await ethers.getContract('Box');

  const encodedFunctionCall =
      box.interface.encodeFunctionData(functionTocCall, args);
  console.log(`Proposing ${functionTocCall} on ${box.address} with ${args}`);
  console.log(`Proposal Description:\n ${proposalDescription}`);
  const proposeTx = await governor.propose(
      [box.address], [0], [encodedFunctionCall], proposalDescription);
  const proposeReceipt = await proposeTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposalId = proposeReceipt.events[0].args.proposalId;
  let proposals = JSON.parse(fs.readFileSync(proposalFile, 'utf-8'));
  proposals[network.config.chainId!.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalFile, JSON.stringify(proposals));
}

propose([77], 'store', PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });