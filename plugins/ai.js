const fs = require('fs-extra');
const { TelegraPh, aitts, Index, prefix, Config, parsedJid, sleep, Draw, getDateTime } = require('../lib');
const axios = require('axios');
const fetch = require('node-fetch');
const { aiResponse } = require('../mods');
Index(
  {
    pattern: 'chat',
    desc: 'chat with an AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      return message.reply(await aiResponse(message, 'chat', query));
    } catch (error) {
      await message.error(`${error}\n\ncommand: chat`, error, '*_No response from chatbot, sorry!!_*');
    }
  }
);

Index(
  {
    pattern: 'gpt',
    desc: 'chat with an AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      query = query || message.reply_text;
      if (!query) {
        return message.reply("Provide me a query, e.g., 'What is Life?'");
      }

      try {
        const response = await fetch(`https://api.maher-zubair.tech/ai/chatgpt2?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data && data.status === 200 && data.result) {
          return await message.reply(data.result);
        } else {
          return message.reply('*_Error while getting GPT response!!_*');
        }
      } catch (error) {
        console.error('Error fetching from api.maher-zubair.tech:', error);
      }

      if (!Config.OPENAI_API_KEY || !Config.OPENAI_API_KEY.startsWith('sk')) {
        return message.reply('*_No API Key Was Found._*');
      }

      if (!query) {
        return message.reply(`Hey there! ${message.senderName}. How are you doing these days?`);
      }

      return message.send(await aiResponse(message, 'gpt', query));
    } catch (error) {
      await message.error(`${error}\n\ncommand: gpt`, error, '*_No response from ChatGPT, sorry!!_*');
    }
  }
);

Index(
  {
    pattern: 'gpt2',
    desc: 'chat with an AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      query = query || message.reply_text;
      if (!query) {
        return message.reply("Provide me a query, e.g., 'What is Life?'");
      }

      const response = await fetch(`https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.status === 200 && data.result) {
        return await message.send(data.result);
      } else {
        await message.send('*_Error while getting GPT response!!_*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: fgpt`, error, '*_No response from ChatGPT, sorry!!_*');
    }
  }
);

Index(
  {
    pattern: 'dalle',
    desc: 'chat with an AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      if (!query) {
        return await message.reply('*Give Me A Query To Get Dall-E Response?*');
      }

      const apiUrl = `https://api.maher-zubair.tech/ai/aiimg?q=${encodeURIComponent(query)}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 200 && data.result.aiImageData.length > 0) {
          const imageUrl = data.result.aiImageData[0].imageHighResolution.url;
          return await message.bot.sendMessage(message.chat, {
            image: { url: imageUrl },
            caption: `[PROMPT]: \`\`\`${query}\`\`\`  \n ${Config.caption} `,
          });
        } else {
          throw new Error('No image data received from API');
        }
      } catch (error) {
        console.log('ERROR IN DALLE RESPONSE FROM API\n', error);
        return await message.reply('*_Error occurred while fetching the image._*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: dalle`, error, '*_No response from Dall-E AI, Sorry!!_*');
    }
  }
);
const AnonyMsg = {};
let isAnnonyMsgAlive = '';

class AnonymousMsg {
  constructor() {
    this.id = '';
    this.sender = '';
    this.receiver = '';
    this.senderMsg = '';
    this.tellInfo = 0;
    this.replyCount = 0;
  }
}

Index(
  {
    pattern: 'anmsg',
    desc: 'Send message Anonymously',
    category: 'ai',
  },
  async (message, text, { smd: cmd }) => {
    try {
      const input = text || message.reply_text;
      if (!input) {
        return await message.send(`*Provide number with msg to send Anonymously.* \n*Example ${prefix + cmd} 2348039607375,your_Message*`, {}, '', message);
      }

      if (message.isCreator && input === 'info') {
        return await message.reply(isAnnonyMsgAlive ? `*Anonymous Chat Receivers*\n_${isAnnonyMsgAlive}_` : '*No Anonymous Chat created yet*');
      }

      const commaIndex = input.indexOf(',');
      if (commaIndex === -1) {
        return await message.reply('*Invalid format. Please provide both number and Message separated by a comma.*');
      }

      const receiverJid = `${input.slice(0, commaIndex).trim()}@s.whatsapp.net`;
      const messageContent = input.slice(commaIndex + 1).trim();
      const parsedReceivers = await parsedJid(receiverJid);

      if (parsedReceivers[0]) {
        const { date, time } = await getDateTime();
        const anonymousId = `anony-msg-${Math.floor(100000 + Math.random() * 900000)}`;
        AnonyMsg[anonymousId] = new AnonymousMsg();
        const anonymousMessage = AnonyMsg[anonymousId];

        anonymousMessage.id = anonymousId;
        anonymousMessage.sender = message.sender;
        anonymousMessage.receiver = parsedReceivers[0];
        anonymousMessage.msgStatus = true;
        anonymousMessage.senderMsg = message;

        const formattedMessage = `*ᴀɴɴᴏɴʏᴍᴏᴜs ᴍsɢ*\n\n*Msg_Id:* ${anonymousMessage.id}\n*Date:* _${date}_\n*Time:* _${time}_\n\n*Message:* ${messageContent}\n\n\n${Config.caption}`;

        isAnnonyMsgAlive += `,${anonymousMessage.receiver}`;
        await message.bot.sendMessage(anonymousMessage.receiver, { text: formattedMessage });
        return await message.reply('*_Anonymous message sent successfully_*');
      } else {
        return await message.reply('*_Provided number is not valid!!!_*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: ${cmd}`, error, "*_Can't send anonymous message yet, Sorry!!_*");
    }
  }
);

Index(
  {
    on: 'text',
  },
  async message => {
    try {
      if (message.quoted && isAnnonyMsgAlive.includes(message.sender) && message.text.length > 2) {
        const quotedLines = message.reply_text.split('\n');
        if (quotedLines.length < 3) {
          return;
        }

        if (message.reply_text.includes('ᴀɴɴᴏɴʏᴍᴏᴜs ᴍsɢ') && quotedLines[0].includes('ᴀɴɴᴏɴʏᴍᴏᴜs ᴍsɢ') && quotedLines[2].includes('Msg_Id')) {
          const msgId = quotedLines[2].replace('*Msg_Id:* ', '').trim();
          const anonymousMessage = AnonyMsg[msgId];
          if (!anonymousMessage) {
            return;
          }

          try {
            const firstWord = message.text.split(',')[0].trim().toLowerCase();
            if (firstWord === 'reply') {
              anonymousMessage.replyCount += 1;
              const commaIndex = message.text.indexOf(',');
              const replyContent = `*ʏᴏᴜʀ ᴀɴᴏɴʏ-ᴍsɢ ʀᴇᴘʟʏ*\n\n*_From @${anonymousMessage.receiver.split('@')[0]}_*\n*_Msg_Id: ${anonymousMessage.id}_*\n\n*Message:* ${message.text.slice(commaIndex + 1).trim()}\n\n\n\n${Config.caption}`;

              if (anonymousMessage.replyCount >= 2) {
                isAnnonyMsgAlive = isAnnonyMsgAlive.replace(`,${message.sender}`, '');
              }

              await message.bot.sendMessage(
                anonymousMessage.sender,
                {
                  text: replyContent,
                  mentions: [anonymousMessage.receiver],
                },
                {
                  quoted: anonymousMessage.senderMsg,
                }
              );

              if (anonymousMessage.replyCount >= 2) {
                isAnnonyMsgAlive = isAnnonyMsgAlive.replace(`,${message.sender}`, '');
                delete AnonyMsg[msgId];
              }

              return await message.reply(`*_Your Message successfully delivered to User_* ${anonymousMessage.replyCount == 1 ? '\n*you can reply 1 more time*' : ''} `);
            } else if (anonymousMessage.tellInfo === 0) {
              anonymousMessage.tellInfo = 1;
              const infoMessage = `*Basically, It's an Anonymous Message*\n\n_Msg_Id: ${anonymousMessage.id}_\n_This message was sent by a chatbot_\n_User doesn't want to expose themselves to send that msg_\n\n\n*If you want to reply to that user,*\n*Send a message by replying to the above message*\n*Type like:* reply, Type_your_Message_Here\n*Example:* reply, Can you text me from your number\n\n\n${Config.caption}`;
              message.bot.sendMessage(
                anonymousMessage.receiver,
                {
                  text: infoMessage,
                },
                {
                  quoted: message,
                }
              );
            } else if (anonymousMessage.tellInfo === 1) {
              anonymousMessage.tellInfo = 2;
              message.reply('*Please follow the format to reply to the message*\n*Type like: _reply, Type_your_Message_Here_*');
            }
          } catch (error) {
            console.log('error : ', error);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
    }
  }
);

async function processing(imageBuffer, endpoint) {
  try {
    const FormData = require('form-data');
    return new Promise(async (resolve, reject) => {
      const form = new FormData();
      const scheme = `https://inferenceengine.vyro.ai/${endpoint}`;
      form.append('model_version', 1, {
        'Content-Transfer-Encoding': 'binary',
        contentType: 'multipart/form-data; charset=utf-8',
      });
      form.append('image', Buffer.from(imageBuffer), {
        filename: `${endpoint}.jpg`,
        contentType: 'image/jpeg',
      });
      form.submit(
        {
          url: scheme,
          host: 'inferenceengine.vyro.ai',
          path: `/${endpoint}`,
          protocol: 'https:',
          headers: {
            'User-Agent': 'okhttp/4.9.3',
            Connection: 'Keep-Alive',
            'Accept-Encoding': 'gzip',
          },
        },
        function (err, res) {
          if (err) {
            reject(err);
          }
          let chunks = [];
          res
            .on('data', function (chunk) {
              chunks.push(chunk);
            })
            .on('end', () => {
              resolve(Buffer.concat(chunks));
            })
            .on('error', error => {
              reject(error);
            });
        }
      );
    });
  } catch (error) {
    console.log(error);
    return imageBuffer;
  }
}

Index(
  {
    cmdname: 'hd',
    desc: 'enhance image quality!',
    category: 'ai',
  },
  async message => {
    let quotedMessage = message.image ? message : message.reply_message;
    if (!quotedMessage || !quotedMessage.image) {
      return await message.send('*Reply to image, to enhance quality!*');
    }
    try {
      let downloadedImage = await quotedMessage.download();
      const enhancedImage = await processing(downloadedImage, 'enhance');
      await message.send(enhancedImage, {}, 'img', message);
      downloadedImage = false;
    } catch (error) {
      message.error(`${error}\n\nCommand: remini`, error, '*Process Denied :(*');
    }
  }
);

Index(
  {
    cmdname: 'dehaze',
    desc: 'enhance image quality!',
    category: 'ai',
  },
  async message => {
    let quotedMessage = message.image ? message : message.reply_message;
    if (!quotedMessage || !quotedMessage.image) {
      return await message.send('*Reply to image, to enhance quality!*');
    }
    try {
      let downloadedImage = await quotedMessage.download();
      const dehasedImage = await processing(downloadedImage, 'dehaze');
      await message.send(dehasedImage, {}, 'img', message);
      downloadedImage = false;
    } catch (error) {
      message.error(`${error}\n\nCommand: dehaze`, error, '*Process Denied :(*');
    }
  }
);

Index(
  {
    cmdname: 'recolor',
    desc: 'enhance image quality!',
    category: 'ai',
  },
  async message => {
    let quotedMessage = message.image ? message : message.reply_message;
    if (!quotedMessage || !quotedMessage.image) {
      return await message.send('*Reply to image, to enhance quality!*');
    }
    try {
      let downloadedImage = await quotedMessage.download();
      const recoloredImage = await processing(downloadedImage, 'recolor');
      await message.send(recoloredImage, {}, 'img', message);
      downloadedImage = false;
    } catch (error) {
      message.error(`${error}\n\nCommand: recolor`, error, '*Process Denied :(*');
    }
  }
);

Index(
  {
    pattern: 'blackbox',
    desc: 'Get information and sources for a given text from Blackbox API.',
    category: 'ai',
  },
  async (message, input) => {
    try {
      const text = input.trim();
      if (!text) {
        return await message.send('*_Please provide some text to query Blackbox._*');
      }

      const apiUrl = `https://aemt.me/blackbox?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, {
        headers: {
          accept: 'application/json',
        },
      });

      if (!response.data || !response.data.result) {
        return await message.reply('*Failed to fetch information from Blackbox.*');
      }

      const { result } = response.data;
      const messageToSend = `\nOk here we Go!: ${result}`;
      return await message.send(messageToSend);
    } catch (error) {
      console.error('Error in Blackbox command:', error);
      await message.error(error + '\n\nCommand: blackbox', error, '*Failed to fetch information from Blackbox.*');
    }
  }
);
Index(
  {
    pattern: 'imagine',
    desc: 'Generate an image using AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      query = query || message.reply_text;
      if (!query) {
        return await message.reply('*Give Me A Query To Generate An Image*');
      }

      let aiResponse = false;
      try {
        const response = await fetch(`https://aemt.me/openai?text=${query} \nNOTE: Make sure it looks like imagination, make it short and concise, also in English!`);
        const data = await response.json();
        aiResponse = data && data.status && data.result ? data.result : '';
      } catch (error) {
        console.error('Error fetching AI response:', error);
      }

      try {
        const image = await Draw(query);
        await message.bot.sendMessage(message.chat, {
          image: image,
          caption: `*[IMAGINATION]:* \`\`\`${query}\`\`\`${aiResponse ? `\n\n*[RESPONSE]:* \`\`\`${aiResponse}\`\`\` \n` : ''}\n${Config.caption}`,
        });
        return;
      } catch (error) {
        console.error('ERROR IN IMAGINE RESPONSE FROM IMAGINE API:', error);
      }

      if (!Config.OPENAI_API_KEY || !Config.OPENAI_API_KEY.startsWith('sk')) {
        return message.reply('*_No API Key Found._*');
      }

      return await message.bot.sendMessage(message.chat, {
        image: {
          url: await aiResponse(message, 'dalle', query),
        },
        caption: '*DALL-E IMAGES*\n' + Config.caption,
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: imagine`, error, '*_No response from Server side, Sorry!!_*');
    }
  }
);
Index(
  {
    pattern: 'imagine2',
    desc: 'Generate an image using AI',
    category: 'ai',
  },
  async (message, query) => {
    try {
      query = query || message.reply_text;
      if (!query) {
        return await message.reply('*Give Me A Query To Generate An Image*');
      }

      let aiResponse = false;
      try {
        const response = await fetch(`https://api.maher-zubair.tech/ai/imagine?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data && data.status === 200 && data.result && data.result.length > 0) {
          aiResponse = data.result[0].images[0].url;
        } else {
          return await message.reply('*No image generated, please try again with a different prompt.*');
        }
      } catch (error) {
        console.error('Error fetching AI response:', error);
        return await message.reply('*Error generating image, please try again later.*');
      }

      try {
        await message.bot.sendMessage(message.chat, {
          image: { url: aiResponse },
          caption: `*[IMAGINATION]:* \n\n${query}\n\n${Config.caption}`,
        });
        return;
      } catch (error) {
        console.error('ERROR IN SENDING IMAGE RESPONSE:', error);
        return await message.reply('*Error sending image, please try again later.*');
      }
    } catch (error) {
      console.error('Error in imagine command:', error);
      await message.reply('*_No response from Server side, Sorry!!_*');
    }
  }
);

Index(
  {
    pattern: 'rmbg',
    category: 'ai',

    desc: 'Remove image Background.',
  },
  async message => {
    try {
      if (!Config.REMOVE_BG_KEY) {
        return message.reply('*_API Key Not Found._*');
      }

      const validTypes = ['imageMessage'];
      const quotedMessage = validTypes.includes(message.mtype) ? message : message.reply_message;

      if (!quotedMessage || !validTypes.includes(quotedMessage?.mtype)) {
        return await message.send('*_Uhh Dear, Reply to an image_*');
      }

      const mediaPath = await message.bot.downloadAndSaveMediaMessage(quotedMessage);
      const imageUrl = await TelegraPh(mediaPath);

      try {
        fs.unlinkSync(mediaPath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      const removedBgImage = await aiResponse(message, 'rmbg', imageUrl);
      if (removedBgImage) {
        await message.send(removedBgImage, { caption: Config.caption }, 'image', message);
      } else {
        await message.send('*_Request could not be processed!!_*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: rmbg`, error, '*_No response from remove.bg, Sorry!!_*');
    }
  }
);

Index(
  {
    pattern: 'ads',
    category: 'ai',
    desc: 'Advertise your message by sending it to a provided number range.',
    fromMe: true,
  },
  async (message, args) => {
    try {
      const input = args || message.reply_text;
      if (!input) {
        return await message.reply(`*Advertise your message*\n*by sending it to a provided number range.*\n${Config.prefix}advt 234902786xx,Your_text_here`);
      }

      const [numberRange, userMessage] = input.split(',').map(s => s.trim());
      if (!numberRange || !userMessage) {
        return await message.send('*Invalid format. Please provide number range and message separated by a comma.*');
      }

      if (!numberRange.includes('x')) {
        return message.send(`*You did not add 'x' in the number range.*\n*Example: ${Config.prefix}advt 234902786xx,Your_Message_here*\n${Config.caption}`);
      }

      await message.send('*Sending message to given number range. Please wait...*');

      const fullMessage = `${userMessage}\n\n\n${Config.caption}`;
      const [prefix, suffix] = numberRange.split('x');
      const xCount = (numberRange.match(/x/g) || []).length;
      const maxIterations = Math.pow(10, xCount);

      if (xCount > 3) {
        return await message.send("*Only up to 3 'x' characters are allowed in the number range*");
      }

      let sentCount = 0;
      let lastUser = '';
      const sentNumbers = new Set();

      for (let i = 0; i < maxIterations; i++) {
        const paddedNumber = i.toString().padStart(xCount, '0');
        const fullNumber = `${prefix}${paddedNumber}${suffix}@s.whatsapp.net`;

        const [userInfo] = await message.bot.onWhatsApp(fullNumber);
        if (userInfo && !sentNumbers.has(fullNumber)) {
          await sleep(1500);
          await message.bot.sendMessage(userInfo.jid, { text: fullMessage });
          sentNumbers.add(fullNumber);
          sentCount++;
          lastUser = fullNumber.split('@')[0];
        }
      }

      return await message.send(`*_Advertisement of your message is complete._*\n\n*_Message successfully sent to ${sentCount} chats_*\nLast User: ${lastUser}\nNumbers searched: ${maxIterations}\n\n\n${Config.caption}`);
    } catch (error) {
      await message.error(`${error}\n\ncommand: advt`, error, '*_No response from server side. Sorry!_*');
    }
  }
);

Index(
  {
    pattern: 'aitts',
    desc: 'Text to Voice Using Eleven Labs AI',
    category: 'ai',
  },
  async (message, args) => {
    await aitts(message, args || message.reply_text);
  }
);
