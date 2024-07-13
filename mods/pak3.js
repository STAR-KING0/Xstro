const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function insta(url) {
  const apiUrl = `https://instadl.giftedtech.workers.dev/?url=${encodeURIComponent(url)}`;
  try {
    const response = await axios.get(apiUrl);
    if (response.data.status && response.data.code === 200) {
      return response.data.result;
    } else {
      throw new Error('Failed to fetch Instagram content.');
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);
  const response = await axios.get(fileUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function insta(url) {
  const apiUrl = `https://instadl.giftedtech.workers.dev/?url=${encodeURIComponent(url)}`;
  try {
    const response = await axios.get(apiUrl);
    if (response.data.status && response.data.code === 200) {
      return response.data.result;
    } else {
      throw new Error('Failed to fetch Instagram content.');
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);
  const response = await axios.get(fileUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function bufferdata(filePath) {
  return fs.promises.readFile(filePath);
}
module.exports = {
  insta,
  downloadFile,
  bufferdata,
};
