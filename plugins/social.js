const { bot } = require('../lib');
const path = require('path');
const fs = require('fs');
const { downloadFile, bufferdata, insta } = require('../mods');
bot(
  {
    pattern: 'insta',
    fromMe: false,
    desc: 'Download Instagram content',
    type: 'social',
  },
  async (message, match) => {
    const url = match[1];
    if (!url) {
      await message.sendMessage('Please provide a URL.');
      return;
    }

    try {
      const result = await insta(url);
      for (const item of result) {
        const outputPath = path.join(__dirname, 'temp', 'insta');
        await downloadFile(item.url, outputPath);
        const buffer = await bufferdata(outputPath);
        await message.sendMessage(buffer, { mimetype: 'image/jpeg', filename: 'insta.jpg' });
        fs.unlinkSync(outputPath);
      }
    } catch (error) {
      await message.sendMessage(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'story',
    fromMe: false,
    desc: 'Download Instagram story',
    type: 'social',
  },
  async (message, match) => {
    const url = match[1];
    if (!url) {
      await message.sendMessage('Please provide a URL.');
      return;
    }

    try {
      const result = await insta(url);
      for (const item of result) {
        const outputPath = path.join(__dirname, 'temp', 'story');
        await downloadFile(item.url, outputPath);
        const buffer = await bufferdata(outputPath);
        await message.sendMessage(buffer, { mimetype: 'image/jpeg', filename: 'story.jpg' });
        fs.unlinkSync(outputPath);
      }
    } catch (error) {
      await message.sendMessage(`Error: ${error.message}`);
    }
  }
);
