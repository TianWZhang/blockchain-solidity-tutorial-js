const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imageFilePath) {
  const fullImagesPath = path.resolve(imageFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  console.log("Uploading to Pinata!");
  for (i in files) {
    console.log(`Working on ${i} ...`);
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[i]}`
    );
    const options = {
      pinataMetadata: {
        name: files[i],
      },
    };
    try {
      const response = await pinata.pinFileToIPFS(
        readableStreamForFile,
        options
      );
      responses.push(response);
    } catch (e) {
      console.log(e);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
