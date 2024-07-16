const { bot, AdReply } = require('../lib');
const ytModule = require('../mods/pak4');
const fs = require('fs').promises;

// Extract video ID from URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

bot(
  {
    pattern: 'ytv',
    desc: 'Downloads YouTube videos with audio.',
    type: 'youtube',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        return await message.send('*_Provide YouTube video URL_*');
      }
      await message.reply('*_Fetching video info..._*');

      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Failed to extract video ID from URL');
      }

      const info = await ytModule.getInfo(videoId);
      if (!info.status) {
        throw new Error('Failed to fetch video info');
      }

      await message.reply(`*Downloading: ${info.title}*\n*This may take a while depending on the video size.*`);

      // Ensure we get a format with both video and audio
      const filePath = await ytModule.download(videoId, {
        type: 'video',
        quality: 'best',
        format: 'mp4',
      });

      if (!filePath) {
        throw new Error('Failed to download video');
      }

      await message.reply('*Upload starting. This may take a while for larger videos.*');

      await message.bot.sendMessage(
        message.chat,
        {
          video: { url: filePath },
          caption: `*Video Info:* ${info.title}\n*Duration:* ${info.duration} seconds\n*Views:* ${info.views}`,
          mimetype: 'video/mp4',
        },
        { quoted: message }
      );

      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'yta',
    desc: 'Downloads YouTube audio.',
    type: 'youtube',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        return await message.send('*_Provide YouTube video URL_*');
      }
      await message.reply('*_Fetching audio info..._*');

      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Failed to extract video ID from URL');
      }

      const info = await ytModule.getInfo(videoId);
      if (!info.status) {
        throw new Error('Failed to fetch video info');
      }

      await message.reply(`*Downloading audio: ${info.title}*`);
      const filePath = await ytModule.download(videoId, { type: 'audio' });

      if (!filePath) {
        throw new Error('Failed to download audio');
      }

      await message.bot.sendMessage(
        message.chat,
        {
          audio: { url: filePath },
          mimetype: 'audio/mpeg',
          caption: `*Title:* ${info.title}\n*Duration:* ${info.duration} seconds`,
        },
        {
          contextInfo: AdReply,
        },
        { quoted: message }
      );

      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);
