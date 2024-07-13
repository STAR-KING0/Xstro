const { bot } = require('../lib');
const { insta, instaStory } = require('../mods');
const path = require('path')
const fs = require('fs')
bot(
  {
    pattern: 'insta',
    desc: 'Downloads Instagram reels and videos.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.startsWith('https://')) {
        return await message.send('*_Provide Instagram Url_*');
      }
      await message.reply('*_Downloading Video..._*');

      const filePath = await insta(url);
      const mediaType = path.extname(filePath).toLowerCase() === '.mp4' ? 'video' : 'image';
      const mediaOptions = {
        [mediaType]: { url: filePath },
      };

      await message.bot.sendMessage(message.chat, mediaOptions, { quoted: message });
      fs.unlinkSync(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'story',
    desc: 'Downloads Instagram media.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.split(' ')[0].trim();
      if (!url || !url.startsWith('https://')) {
        return await message.send('*_Provide Link_*');
      }
      await message.reply('*_Downloading Image..._*');
      const { filePath, mediaType } = await instaStory(url);

      const mediaMessage = {
        [mediaType]: { url: filePath },
      };

      await message.bot.sendMessage(message.chat, mediaMessage, { quoted: message });
      fs.unlinkSync(filePath);
    } catch (error) {
      await message.error(`${error}\n\ncommand: story`, error);
    }
  }
);
