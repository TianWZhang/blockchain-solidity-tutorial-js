const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNFT Uint Tests", function() {
      let deployer, basicNft;
      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNft", deployer);
      });

      describe("constructor", function() {
        it("Initializes the NFT Correctly", async function() {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(tokenCounter, 0);
          assert.equal(name, "Dogie");
          assert.equal(symbol, "DOG");
        });
      });

      describe("mintNFT", function() {
        beforeEach(async function() {
          const txResponse = await basicNft.mintNft();
          await txResponse.wait(1);
        });

        it("allows users to mint an NFT, and updates appropriately", async function() {
          const tokenCounter = await basicNft.getTokenCounter();
          const tokenURI = await basicNft.tokenURI(0);
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
          assert.equal(tokenCounter, 1);
        });

        it("shows the correct balance and owner of an NFT", async function() {
          const deployerBalance = await basicNft.balanceOf(deployer);
          const owner = await basicNft.ownerOf("0");

          assert.equal(owner, deployer);
          assert.equal(deployerBalance, 1);
        });
      });
    });
