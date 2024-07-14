const { bot } = require('../lib');
const { insta, instaStory, facebook } = require('../mods');
const fs = require('fs').promises;

bot(
  {
    pattern: 'insta',
    desc: 'Downloads Instagram reels and posts.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.startsWith('https://www.instagram.com/')) {
        return await message.send('*_Please provide a valid Instagram URL_*');
      }
      await message.reply('*_Downloading media..._*');

      const { filePath, mediaType } = await insta(url);

      await message.bot.sendMessage(message.chat, { [mediaType]: { url: filePath } }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'story',
    desc: 'Downloads Instagram stories.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.startsWith('https://www.instagram.com/stories/')) {
        return await message.send('*_Please provide a valid Instagram story URL_*');
      }
      await message.reply('*_Downloading story..._*');

      const { filePath, mediaType } = await instaStory(url);

      await message.bot.sendMessage(message.chat, { [mediaType]: { url: filePath } }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'facebook',
    alias: 'fb',
    desc: 'Downloads Facebook videos.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.startsWith('https://')) {
        return await message.send('*_Provide Facebook Video Url_*');
      }
      await message.reply('*_Downloading Video..._*');

      const filePath = await facebook(url);

      await message.bot.sendMessage(message.chat, { video: { url: filePath } }, { quoted: message });
      fs.unlinkSync(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);
