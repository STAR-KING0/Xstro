const { bot } = require('../lib');
const yt = require('../mods/pak4');
const fs = require('fs').promises;

bot(
  {
    pattern: 'ytv',
    desc: 'Downloads YouTube videos.',
    type: 'youtube',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        return await message.send('*_Please provide a valid YouTube video URL_*');
      }
      await message.reply('*_Fetching video info..._*');

      const filePath = await yt.downloadVideo(url);

      if (!filePath) {
        throw new Error('Failed to download video');
      }

      await message.bot.sendMessage(message.chat, { video: { url: filePath }, caption: '*Downloaded YouTube Video*' }, { quoted: message });
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
        return await message.send('*_Please provide a valid YouTube video URL_*');
      }
      await message.reply('*_Fetching audio info..._*');

      const filePath = await yt.downloadAudio(url);

      if (!filePath) {
        throw new Error('Failed to download audio');
      }

      await message.bot.sendMessage(message.chat, { audio: { url: filePath }, mimetype: 'audio/mpeg', caption: '*Downloaded YouTube Audio*' }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);