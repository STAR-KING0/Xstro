const { bot } = require('../lib');
const { insta, instaStory, facebook, twitter, tiktokmp3, tiktok } = require('../mods');
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
        return await message.send('*_IG Reel or Video_*');
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
      if (!url || !url.startsWith('https://')) {
        return await message.send('*_IG Story Url_*');
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

bot(
  {
    pattern: 'twitter',
    desc: 'Downloads Twitter videos.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.includes('https://')) {
        return await message.send('*_Provide Twitter Video URL_*');
      }
      await message.reply('*_Downloading Twitter video..._*');

      const { filePath, description } = await twitter(url);

      await message.bot.sendMessage(message.chat, { video: { url: filePath }, caption: description }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'tiktok',
    desc: 'Downloads TikTok videos.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.includes('tiktok.com/')) {
        return await message.send('*_Provide TikTok Video URL_*');
      }
      await message.reply('*_Downloading TikTok video..._*');

      const { filePath, caption, author } = await tiktok(url);

      await message.bot.sendMessage(message.chat, { video: { url: filePath }, caption: `${caption}\n\nCreator: ${author}` }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'tiktokmp3',
    desc: 'Downloads TikTok audio.',
    type: 'social',
  },
  async (message, match) => {
    try {
      const url = match.trim();
      if (!url || !url.includes('tiktok.com/')) {
        return await message.send('*_Please provide a valid TikTok video URL_*');
      }
      await message.reply('*_Downloading TikTok audio..._*');

      const { filePath, caption, author } = await tiktokmp3(url);

      await message.bot.sendMessage(message.chat, { audio: { url: filePath }, mimetype: 'audio/mpeg', caption: `${caption}\n\nCreator: ${author}` }, { quoted: message });
      await fs.unlink(filePath);
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
);

