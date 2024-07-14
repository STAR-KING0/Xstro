const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const instaApiUrl = 'https://instadl.giftedtech.workers.dev/?url=';

async function downloadMedia(url, filePath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function ensureTempDir() {
  const tempDir = path.join(__dirname, 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

async function insta(url) {
  try {
    const apiUrl = `${instaApiUrl}${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (response.data.status && response.data.result.length > 0) {
      const media = response.data.result[0];
      const mediaUrl = media.url;
      const thumbnailUrl = media.thumbnail;
      const ext = path.extname(new URL(thumbnailUrl).pathname);
      const fileName = `${uuidv4()}${ext || '.mp4'}`;
      const tempDir = await ensureTempDir();
      const filePath = path.join(tempDir, fileName);

      await downloadMedia(mediaUrl, filePath);

      return { filePath, mediaType: ext === '.mp4' ? 'video' : 'image' };
    } else {
      throw new Error('No media found.');
    }
  } catch (error) {
    console.error('Error downloading Instagram media:', error.message);
    throw error;
  }
}

async function instaStory(url) {
  try {
    const apiUrl = `${instaApiUrl}${encodeURIComponent(url)}`;
    const result = await axios.get(apiUrl);

    if (!result.data || !result.data.status) {
      throw new Error('Invalid Media Url!');
    }

    const media = result.data.result[0];
    const mediaUrl = media.url;

    const tempDir = await ensureTempDir();
    const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image';
    const fileName = `media_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const filePath = path.join(tempDir, fileName);

    await downloadMedia(mediaUrl, filePath);

    return { filePath, mediaType };
  } catch (error) {
    console.error('Error downloading Instagram story:', error.message);
    throw error;
  }
}

module.exports = {
  insta,
  instaStory,
};

async function facebook(url) {
  try {
    const apiKey = 'a7P3X3Ix';
    const apiUrl = `https://api.fgmods.xyz/api/downloader/fbdl?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

    const response = await axios.get(apiUrl);

    if (response.data.status && response.data.result) {
      const videoUrl = response.data.result.videoUrl;
      const fileName = `${uuidv4()}.mp4`;
      const filePath = path.join(__dirname, './temp', fileName);

      // Ensure the temp directory exists
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const writer = fs.createWriteStream(filePath);
      const downloadResponse = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream',
      });

      downloadResponse.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } else {
      throw new Error('No video found or invalid response from API.');
    }
  } catch (error) {
    console.error('Error downloading Facebook video:', error.message);
    throw error;
  }
}

module.exports = {
  insta,
  instaStory,
  facebook,
};
