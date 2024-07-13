const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { fetchJson } = require('../lib');
const instaApiUrl = 'https://instadl.giftedtech.workers.dev/?url=';

async function insta(url) {
  try {
    const apiUrl = `https://instadl.giftedtech.workers.dev/?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (response.data.status && response.data.result.length > 0) {
      const media = response.data.result[0];
      const mediaUrl = media.url;
      const thumbnailUrl = media.thumbnail;
      const urlObj = new URL(mediaUrl);
      const ext = path.extname(new URL(thumbnailUrl).pathname);
      const fileName = `${uuidv4()}${ext}.mp4`;
      const filePath = path.join(__dirname, './temp', fileName);

      // Ensure the temp directory exists
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const writer = fs.createWriteStream(filePath);
      const downloadResponse = await axios({
        url: mediaUrl,
        method: 'GET',
        responseType: 'stream',
      });

      downloadResponse.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } else {
      throw new Error('No media found.');
    }
  } catch (error) {
    console.error('Error downloading media:', error.message);
    throw error;
  }
}

async function instaStory(url) {
  const apiUrl = `${instaApiUrl}${url}`;
  const result = await fetchJson(apiUrl);

  if (!result || !result.status) {
    throw new Error('Invalid Media Url!');
  }

  const media = result.result[0];
  const mediaUrl = media.url;

  // Download media
  const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
  const mediaBuffer = Buffer.from(response.data, 'binary');

  const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image';

  const downloadsFolder = path.join(__dirname, './temp');
  if (!fs.existsSync(downloadsFolder)) {
    fs.mkdirSync(downloadsFolder, { recursive: true });
  }

  const fileName = `media_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
  const filePath = path.join(downloadsFolder, fileName);

  // Save media to local file
  fs.writeFileSync(filePath, mediaBuffer);

  return { filePath, mediaType };
}

module.exports = {
  insta,
  instaStory,
};
