// yt.js
const YouTube = require('youtubei.js');
const ytdl = require('ytdl-core');
const fs = require('fs').promises;
const FileType = require('file-type');
const path = require('path');
const youtube = new YouTube.Client();

async function ensureTempDir() {
  const tempDir = path.join(__dirname, 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

async function downloadMedia(url, type) {
  const video = await youtube.getVideo(url);
  const videoId = video.id;
  const title = video.title.replace(/[^a-zA-Z0-9]/g, '_');
  const fileType = type === 'audio' ? 'highestaudio' : 'highestvideo';
  const fileName = `${title}.${type === 'audio' ? 'mp3' : 'mp4'}`;
  const tempDir = await ensureTempDir();
  const filePath = path.join(tempDir, fileName);

  const stream = ytdl(videoId, { quality: fileType });
  const fileWriteStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    stream.pipe(fileWriteStream);
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  const fileTypeInfo = await FileType.fromFile(filePath);

  if (!fileTypeInfo) {
    throw new Error('Unable to determine file type');
  }

  const finalFileName = `${title}.${fileTypeInfo.ext}`;
  const finalFilePath = path.join(tempDir, finalFileName);
  await fs.rename(filePath, finalFilePath);

  return finalFilePath;
}

async function downloadVideo(url) {
  return await downloadMedia(url, 'video');
}

async function downloadAudio(url) {
  return await downloadMedia(url, 'audio');
}

module.exports = { downloadVideo, downloadAudio };