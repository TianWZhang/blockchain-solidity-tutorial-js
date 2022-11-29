import {assert, expect} from 'chai';
// @ts-ignore
import {deployments, ethers} from 'hardhat';
import {MIN_DELAY, PROPOSAL_DESCRIPTION, VOTING_DELAY, VOTING_PERIOD} from '../../helper-hardhat-config';
import {Box, GovernanceToken, GovernorContract, TimeLock} from '../../typechain-types';
import {moveBlocks} from '../../utils/move-blocks';
import {moveTime} from '../../utils/move-time';

describe('Governor Flow', function() {
  let governor: GovernorContract;
  let governanceToken: GovernanceToken;
  let timeLock: TimeLock;
  let box: Box;
  const voteWay = 1;
  const reason = 'I lika do da cha cha';

  beforeEach(async function() {
    await deployments.fixture(['all']);
    governor = await ethers.getContract('GovernorContract');
    timeLock = await ethers.getContract('TimeLock');
    governanceToken = await ethers.getContract('GovernanceToken');
    box = await ethers.getContract('Box');
  });

  it('can only be changed through governance', async () => {
    await expect(box.store(55))
        .to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('proposes, votes, waits, queues, and then executes', async () => {
    const encodedFunctionCall = box.interface.encodeFunctionData('store', [77]);
    const proposeTx = await governor.propose(
        [box.address], [0], [encodedFunctionCall], PROPOSAL_DESCRIPTION);
    const proposeReceipt = await proposeTx.wait(1);
    const proposalId = proposeReceipt.events![0].args!.proposalId;
    let proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);  // 0
    await moveBlocks(VOTING_DELAY + 1);

    const voteTx =
        await governor.castVoteWithReason(proposalId, voteWay, reason);
    await voteTx.wait(1);
    proposalState = await governor.state(proposalId);
    assert.equal(proposalState.toString(), '1');
    console.log(`Current Proposal State: ${proposalState}`);  // 1
    await moveBlocks(VOTING_PERIOD + 1);

    // utils.id (utf8String)  =>  hex
    // Compute the keccak256 cryptographic hash of a UTF-8 string, returned as a
    // hex string. Equivalent to
    // const descriptionHash =
    // ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));
    const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
    const queueTx = await governor.queue(
        [box.address], [0], [encodedFunctionCall], descriptionHash);
    await queueTx.wait(1);
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
    proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);  // 5

    console.log('Executing...');
    const exTx = await governor.execute(
        [box.address], [0], [encodedFunctionCall], descriptionHash);
    await exTx.wait(1);
    console.log((await box.retrieve()).toString());
  })
});
