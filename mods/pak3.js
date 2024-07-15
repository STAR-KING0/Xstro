const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FileType = require('file-type');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

const instaApiUrl = 'https://instadl.giftedtech.workers.dev/?url=';

async function downloadMedia(url) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  // Determine file type from stream
  const fileTypeStream = await FileType.stream(response.data);

  // Generate a unique file name based on the detected file type
  const ext = fileTypeStream.fileType?.ext || 'bin';
  const fileName = `${uuidv4()}.${ext}`;
  const tempDir = await ensureTempDir();
  const filePath = path.join(tempDir, fileName);

  // Write the stream to a file
  await pipeline(fileTypeStream, fs.createWriteStream(filePath));

  return { filePath, mediaType: ext };
}

async function ensureTempDir() {
  const tempDir = path.join(__dirname, 'temp');
  await fsp.mkdir(tempDir, { recursive: true });
  return tempDir;
}

//========[INSTAGRAM VIDEOS AND REELS]=========\\
async function insta(url) {
  try {
    const apiUrl = `${instaApiUrl}${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (response.data.status && response.data.result.length > 0) {
      const media = response.data.result[0];
      const mediaUrl = media.url;

      const { filePath, mediaType } = await downloadMedia(mediaUrl);

      return { filePath, mediaType: mediaType === 'mp4' ? 'video' : 'image' };
    } else {
      throw new Error('No media found.');
    }
  } catch (error) {
    console.error('Error downloading Instagram media:', error.message);
    throw error;
  }
}

//=========[INSTAGRAM STORIES | IMAGES]====\\
async function instaStory(url) {
  try {
    const apiUrl = `${instaApiUrl}${encodeURIComponent(url)}`;
    const result = await axios.get(apiUrl);

    if (!result.data || !result.data.status) {
      throw new Error('Invalid Media Url!');
    }

    const media = result.data.result[0];
    const mediaUrl = media.url;

    const { filePath, mediaType } = await downloadMedia(mediaUrl);

    return { filePath, mediaType: mediaType === 'mp4' ? 'video' : 'image' };
  } catch (error) {
    console.error('Error downloading Instagram story:', error.message);
    throw error;
  }
}
//=========[FACEBOOK]===============\\
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

async function twitter(url) {
  try {
    const twitterApiUrl = `https://api.fgmods.xyz/api/downloader/twitter?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

    const response = await axios.get(twitterApiUrl);

    if (response.data.status && response.data.result) {
      const videoUrl = response.data.result.HD;
      const description = response.data.result.desc;
      const fileName = `${uuidv4()}.mp4`;
      const tempDir = path.join(__dirname, 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const filePath = path.join(tempDir, fileName);

      const videoResponse = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'arraybuffer',
      });

      await fs.writeFile(filePath, Buffer.from(videoResponse.data));

      return { filePath, description };
    } else {
      throw new Error('No video found or invalid response from API.');
    }
  } catch (error) {
    console.error('Error downloading Twitter video:', error.message);
    throw error;
  }
}
const tiktokApiUrl = 'https://api.fgmods.xyz/api/downloader/tiktok';

async function downloadTiktokMedia(url, filePath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });
  await fs.writeFile(filePath, Buffer.from(response.data));
}

async function tiktok(url) {
  try {
    const response = await axios.get(`${tiktokApiUrl}?url=${encodeURIComponent(url)}&apikey=${apiKey}`);

    if (response.data.status && response.data.result) {
      const videoUrl = response.data.result.play;
      const fileName = `${uuidv4()}.mp4`;
      const tempDir = path.join(__dirname, 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const filePath = path.join(tempDir, fileName);

      await downloadTiktokMedia(videoUrl, filePath);

      return {
        filePath,
        caption: response.data.result.title,
        author: response.data.result.author.nickname,
      };
    } else {
      throw new Error('No video found or invalid response from API.');
    }
  } catch (error) {
    console.error('Error downloading TikTok video:', error.message);
    throw error;
  }
}

async function tiktokmp3(url) {
  try {
    const response = await axios.get(`${tiktokApiUrl}?url=${encodeURIComponent(url)}&apikey=${apiKey}`);

    if (response.data.status && response.data.result) {
      const audioUrl = response.data.result.music;
      const fileName = `${uuidv4()}.mp3`;
      const tempDir = path.join(__dirname, 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const filePath = path.join(tempDir, fileName);

      await downloadTiktokMedia(audioUrl, filePath);

      return {
        filePath,
        caption: response.data.result.music_info.title,
        author: response.data.result.music_info.author,
      };
    } else {
      throw new Error('No audio found or invalid response from API.');
    }
  } catch (error) {
    console.error('Error downloading TikTok audio:', error.message);
    throw error;
  }
}

module.exports = {
  insta,
  instaStory,
  facebook,
  twitter,
  tiktok,
  tiktokmp3,
};
