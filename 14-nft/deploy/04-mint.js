const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //Basic NFT
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicNftMintTx = await basicNft.mintNft();
  await basicNftMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);

  //Random IPFS NFT
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();

  // Need to listen for response
  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000); // 5 minute timeout time
    // setup listener for our event
    randomIpfsNft.once("NftMinted", async function () {
      resolve();
    });

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
      value: mintFee.toString(),
    });
    const randomIpfsNftMintReceipt = await randomIpfsNftMintTx.wait(1);

    if (developmentChains.includes(network.name)) {
      const requestId =
        randomIpfsNftMintReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });

  console.log(
    `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
  );

  //Dynamic SVG NFT
  const highValue = ethers.utils.parseEther("4000");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString());
  await dynamicSvgNftMintTx.wait(1);
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
