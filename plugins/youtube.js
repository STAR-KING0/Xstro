const { bot } = require('../lib');
const yt = require('../mods/pak4');
const fs = require('fs').promises;

bot(
  {
    pattern: 'ytv',
    desc: 'Downloads YouTube videos.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        return await message.send('*_Please provide a valid YouTube video URL_*');
      }
      await message.reply('*_Fetching video info..._*');

      const videoId = url.split('v=')[1] || url.split('/').pop();
      const info = await yt.getInfo(videoId);

      if (!info.status) {
        throw new Error('Failed to fetch video info');
      }

      await message.reply(`*_Downloading video: ${info.title}_*\n*_Quality: ${info.pref_Quality}_*`);

      const filePath = await yt.download(videoId, { type: 'video', quality: info.pref_Quality });

      if (!filePath || (typeof filePath === 'object' && filePath.status === false)) {
        throw new Error('Failed to download video');
      }

      await message.bot.sendMessage(message.chat, { video: { url: filePath }, caption: `*${info.title}*\n\nChannel: ${info.channel}\nViews: ${info.views}\nLikes: ${info.likes}` }, { quoted: message });
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
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
        return await message.send('*_Please provide a valid YouTube video URL_*');
      }
      await message.reply('*_Fetching audio info..._*');

      const videoId = url.split('v=')[1] || url.split('/').pop();
      const info = await yt.getInfo(videoId);

      if (!info.status) {
        throw new Error('Failed to fetch video info');
      }

      await message.reply(`*_Downloading audio: ${info.title}_*`);

      const filePath = await yt.download(videoId, { type: 'audio' });

      if (!filePath || (typeof filePath === 'object' && filePath.status === false)) {
        throw new Error('Failed to download audio');
      }

      await message.bot.sendMessage(message.chat, { audio: { url: filePath }, mimetype: 'audio/mpeg', caption: `*${info.title}*\n\nChannel: ${info.channel}\nViews: ${info.views}\nLikes: ${info.likes}` }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);
