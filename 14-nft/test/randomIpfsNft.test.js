const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("random IPFS NFT test", function() {
      let deployer, randomIpfsNft, mintFee, vrfCoordinatorV2Mock;
      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["mocks", "randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        mintFee = await randomIpfsNft.getMintFee();
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("constructor", function() {
        it("Initializes the NFT Correctly", async function() {
          const name = await randomIpfsNft.name();
          const symbol = await randomIpfsNft.symbol();
          const tokenCounter = await randomIpfsNft.getTokenCounter();
          const tokenUri0 = await randomIpfsNft.getTokenUri(0);

          assert.equal(tokenCounter.toNumber(), 0);
          assert.equal(name, "Random IPFS NFT");
          assert.equal(symbol, "RIN");
          assert.equal(mintFee, "10000000000000000");
          assert(tokenUri0.includes("ipfs://"));
        });
      });

      describe("requestNft", function() {
        it("reverts without enough ether", async function() {
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });

        it("gets request ID with enough ether", async function() {
          await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
            randomIpfsNft,
            "NftRequested"
          );
        });
      });

      describe("fulfillRandomWords", function() {
        it("mints NFT after random number is returned", async function() {
          await new Promise(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async function() {
              try {
                const tokenUri0 = await randomIpfsNft.getTokenUri(0);
                const tokenCounter = await randomIpfsNft.getTokenCounter();
                assert(tokenUri0.includes("ipfs://"));
                assert(tokenCounter.toNumber(), 1);
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });

            try {
              const txResponse = await randomIpfsNft.requestNft({
                value: mintFee,
              });
              const tx = await txResponse.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                tx.events[1].args.requestId,
                randomIpfsNft.address
              );
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });
        });
      });

      describe("getBreedFromRandomNumber", function() {
        it("should return pug if rng mod 100 is less than 10", async function() {
          const breed = await randomIpfsNft.getBreedFromRandomNumber(7);
          assert.equal(breed, 0);
        });
      });
    });
