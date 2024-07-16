const fs = require('fs');
const path = require('path');
const config = require(__dirname + '/../config.js');
const blockJid = ['' + (process.env.BLOCKJIDS || '120363023983262391@g.us'), ...(typeof global.blockJids === 'string' ? global.blockJids.split(',') : [])];
const allowJid = ['null', ...(typeof global.allowJids === 'string' ? global.allowJids.split(',') : [])];
const Pino = require('pino');
const { Boom } = require('@hapi/boom');
const FileType = require('file-type');
const express = require('express');
const app = express();
const events = require('./plugins.js');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif.js');
let { default: XstroInc, proto, prepareWAMessageMedia, downloadContentFromMessage, DisconnectReason, useMultiFileAuthState, generateForwardMessageContent, generateWAMessageFromContent, makeInMemoryStore, jidDecode } = require('@whiskeysockets/baileys');
var last_status = {};
global.setCmdAlias = {};
global.SmdOfficial = false;
global.sqldb = false;
global.pg_pools = false;
const fetch = require('node-fetch');
const axios = require('axios');
const { smsg, callsg, groupsg } = require('./serialized.js');
const { runtime, getSizeMedia, sleep, getBuffer, parsedJid, botpic, tlang, userdb, groupdb, smdBuffer } = require('./index.js');
var prefa = !config.HANDLERS || ['false', 'null', ' ', '', 'nothing', 'not', 'empty'].includes(!config.HANDLERS) ? true : false;
global.prefix = prefa ? '' : config.HANDLERS[0];
global.prefixRegex = prefa || ['all'].includes(config.HANDLERS) ? new RegExp('^') : new RegExp('^[' + config.HANDLERS + ']');
global.prefixboth = ['all'].includes(config.HANDLERS);
let baileys = '/keys/';
const startDb = async () => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: global.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const client = await pool.connect();
    client.release();
    console.log('🌍 Connected to PostgreSQL.');
    return true;
  } catch (error) {
    console.log('Could not connect to PostgreSQL.\n', error);
    return false;
  }
};

let WhatsAppBot = {};
const store = makeInMemoryStore({
  logger: Pino({
    level: 'trace',
  }).child({
    level: 'trace',
  }),
});
try {
  if (fs.existsSync(__dirname + '/store.json')) {
    store.readFromFile(__dirname + '/store.json');
  }
} catch (error) {
  console.log('CLIENT STORE ERROR:\n', error);
}
require('events').EventEmitter.defaultMaxListeners = 2000;
async function syncdb() {
  let imagePath = __dirname + '/assets/logo.jpeg';

  try {
    global.log0 = typeof THUMB_IMAGE === 'string' ? await getBuffer(THUMB_IMAGE.split(',')[0]) : fs.readFileSync(imagePath);
  } catch (error) {
    imagePath = __dirname + '/assets/logo.jpeg';
  }

  global.log0 = global.log0 || fs.readFileSync(imagePath);

  const { state: state, saveCreds: saveCreds } = await useMultiFileAuthState(__dirname + baileys);
  let client = XstroInc({
    logger: Pino({
      level: 'silent' || 'debug' || 'fatal',
    }),
    printQRInTerminal: false,
    browser: ['Windows', 'chrome', 'MacOs'],
    fireInitQueries: true,
    shouldSyncHistoryMessage: true,
    downloadHistory: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
    auth: state,
    getMessage: async messageInfo => {
      let defaultMessage = {
        conversation: 'Connected',
      };

      if (store) {
        const loadedMessage = await store.loadMessage(messageInfo.remoteJid, messageInfo.id);
        return loadedMessage.message || defaultMessage;
      }

      return defaultMessage;
    },
  });
  store.bind(client.ev);
  setInterval(() => {
    try {
      store.writeToFile(__dirname + '/store.json');
    } catch (error) {
      console.log('CLIENT STORE ERROR:\n', error);
    }
  }, 10000);
  client.ev.on('call', async callEvent => {
    let callData = await callsg(client, JSON.parse(JSON.stringify(callEvent[0])));

    events.commands.map(async command => {
      if (command.call === 'offer' && callData.status === 'offer') {
        try {
          command.function(callData, {
            store: store,
            Void: client,
          });
        } catch (error) {
          console.error('[CALL ERROR] ', error);
        }
      }
      if (command.call === 'accept' && callData.status === 'accept') {
        try {
          command.function(callData, {
            store: store,
            Void: client,
          });
        } catch (error) {
          console.error('[CALL ACCEPT ERROR] ', error);
        }
      }
      if (command.call === 'call' || command.call === 'on' || command.call === 'all') {
        try {
          command.function(callData, {
            store: store,
            Void: client,
          });
        } catch (error) {
          console.error('[CALL ERROR] ', error);
        }
      }
    });
  });

  let isBotNumberDecoded = false;
  let groupSettingsCache = {};
  let userSettingsCache = {};

  client.ev.on('messages.upsert', async messageEvent => {
    try {
      if (!messageEvent.messages || !Array.isArray(messageEvent.messages)) {
        return;
      }
      isBotNumberDecoded = isBotNumberDecoded || client.decodeJid(client.user.id);

      for (const message of messageEvent.messages) {
        message.message = Object.keys(message.message || {})[0] === 'ephemeralMessage' ? message.message.ephemeralMessage.message : message.message;
        if (!message.message || !message.key || !/broadcast/gi.test(message.key.remoteJid)) {
          continue;
        }

        let processedMessage = await smsg(client, JSON.parse(JSON.stringify(message)), store, true);
        if (!processedMessage.message) {
          continue;
        }

        let messageBody = processedMessage.body;
        let commandData = {
          body: messageBody,
          mek: message,
          text: messageBody,
          args: messageBody.split(' ') || [],
          botNumber: isBotNumberDecoded,
          isCreator: processedMessage.isCreator,
          store: store,
          budy: messageBody,
          Suhail: {
            bot: client,
          },
          Void: client,
          proto: proto,
        };

        events.commands.map(async command => {
          if (typeof command.on === 'string') {
            let commandTrigger = command.on.trim();
            let isFromMe = !command.fromMe || (command.fromMe && processedMessage.fromMe);

            if (/status|story/gi.test(commandTrigger) && (processedMessage.jid === 'status@broadcast' || message.key.remoteJid === 'status@broadcast') && isFromMe) {
              command.function(processedMessage, messageBody, commandData);
            } else if (['broadcast'].includes(commandTrigger) && (/broadcast/gi.test(message.key.remoteJid) || processedMessage.broadcast || /broadcast/gi.test(processedMessage.from)) && isFromMe) {
              command.function(processedMessage, messageBody, commandData);
            }
          }
        });
      }
    } catch (error) {
      console.log('ERROR broadCast --------- messages.upsert \n', error);
    }
  });

  client.ev.on('messages.upsert', async messageEvent => {
    try {
      isBotNumberDecoded = isBotNumberDecoded || client.decodeJid(client.user.id);

      if (!global.isStart) {
        return;
      }

      for (const message of messageEvent.messages) {
        if (!message.message) {
          continue;
        }
        message.message = Object.keys(message.message || {})[0] === 'ephemeralMessage' ? message.message.ephemeralMessage.message : message.message;
        if (!message.message || !message.key || /broadcast/gi.test(message.key.remoteJid)) {
          continue;
        }

        let processedMessage = await smsg(client, JSON.parse(JSON.stringify(message)), store, true);
        if (!processedMessage.message || processedMessage.chat.endsWith('broadcast')) {
          continue;
        }

        let { body: messageBody } = processedMessage;
        let isCreator = processedMessage.isCreator;
        let trimmedText = typeof processedMessage.text === 'string' ? processedMessage.text.trim() : false;
        if (trimmedText && messageBody[1] && messageBody[1] === ' ') {
          messageBody = messageBody[0] + messageBody.slice(2);
        }

        let isCommand = false;
        let commandName = false;
        let commandPrefix = false;

        if (trimmedText && config.HANDLERS.toLowerCase().includes('null')) {
          isCommand = true;
          commandName = messageBody.split(' ')[0].toLowerCase() || false;
        } else if (trimmedText && !config.HANDLERS.toLowerCase().includes('null')) {
          isCommand = prefixboth || (messageBody && prefixRegex.test(messageBody[0])) || (processedMessage.isSuhail && /2348039607375|2349027862116|17863688449/g.test(isBotNumberDecoded) && messageBody[0] === ',');
          commandName = isCommand ? (prefa ? messageBody.trim().split(' ')[0].toLowerCase() : messageBody.slice(1).trim().split(' ')[0].toLowerCase()) : false;
          commandPrefix = prefixboth ? messageBody.trim().split(' ')[0].toLowerCase() : '';
        } else {
          isCommand = false;
        }

        let aliasCommandName = commandName ? commandName.trim() : '';
        if (aliasCommandName && global.setCmdAlias[aliasCommandName] !== undefined) {
          commandName = global.setCmdAlias[aliasCommandName];
          isCommand = true;
        } else if (processedMessage.mtype === 'stickerMessage') {
          aliasCommandName = 'sticker-' + processedMessage.msg.fileSha256;
          if (global.setCmdAlias[aliasCommandName]) {
            commandName = global.setCmdAlias[aliasCommandName];
            isCommand = true;
          }
        }

        if (blockJid.includes(processedMessage.chat) && !processedMessage.isSuhail) {
          return;
        }

        if (isCommand && (processedMessage.isBaileys || (!isCreator && config.WORKTYPE === 'private' && !allowJid.includes(processedMessage.chat)))) {
          isCommand = false;
        }

        const args = processedMessage.body ? messageBody.trim().split(/ +/).slice(1) : [];
        if (!isCreator && global.disablepm === 'true' && isCommand && !processedMessage.isGroup) {
          isCommand = false;
        }

        if (!isCreator && global.disablegroup === 'true' && isCommand && processedMessage.isGroup && !allowJid.includes(processedMessage.chat)) {
          isCommand = false;
        }

        WhatsAppBot.bot = client;

        if (isCommand) {
          let matchedCommand = events.commands.find(cmd => cmd.pattern === commandName) || events.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));

          if (!matchedCommand && prefixboth && commandPrefix) {
            matchedCommand = events.commands.find(cmd => cmd.pattern === commandPrefix) || events.commands.find(cmd => cmd.alias && cmd.alias.includes(commandPrefix));
          }

          if (matchedCommand && matchedCommand.fromMe && !processedMessage.fromMe && !isCreator) {
            matchedCommand = false;
            return processedMessage.reply(tlang().owner);
          }

          if (processedMessage.isGroup && matchedCommand && commandName !== 'bot') {
            let groupSettings = groupSettingsCache[processedMessage.chat] ||
              (await groupdb.findOne({ id: processedMessage.chat })) || {
                botenable: toBool(processedMessage.isSuhail || !blockJid.includes(processedMessage.chat)),
              };

            if (groupSettings && groupSettings.botenable === 'false') {
              matchedCommand = false;
            }

            if (matchedCommand && groupSettings) {
              let commandPattern = matchedCommand.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              let commandRegex = new RegExp('\\b' + commandPattern + '\\b');
              if (groupSettings.disablecmds !== 'false' && commandRegex.test(groupSettings.disablecmds)) {
                matchedCommand = false;
              }
            }
          }

          if (!isCreator && matchedCommand) {
            try {
              let userSettings = userSettingsCache[processedMessage.sender] || (await userdb.findOne({ id: processedMessage.sender })) || { ban: 'false' };
              if (userSettings.ban === 'true') {
                matchedCommand = false;
                processedMessage.reply('*Hey ' + processedMessage.senderName.split('\n').join('  ') + ',*\n_You are banned from using commands._');
              }
            } catch (banCheckError) {
              console.log('checkban.ban', banCheckError);
            }
          }

          if (matchedCommand) {
            if (matchedCommand.react) {
              processedMessage.react(matchedCommand.react);
            }

            let commandText = processedMessage.body ? messageBody.trim().split(/ +/).slice(1).join(' ') : '';
            let commandPattern = matchedCommand.pattern;
            processedMessage.cmd = commandPattern;

            try {
              matchedCommand.function(processedMessage, commandText, {
                cmd: commandPattern,
                text: commandText,
                body: messageBody,
                args: args,
                cmdName: commandName,
                isCreator: isCreator,
                smd: commandPattern,
                botNumber: isBotNumberDecoded,
                budy: trimmedText,
                store: store,
                Suhail: WhatsAppBot,
                Void: client,
              });
            } catch (commandError) {
              console.log('[ERROR] ', commandError);
            }
          } else {
            isCommand = false;
            const categoryCommand = events.commands.find(cmd => cmd.category === commandName) || false;
            if (categoryCommand) {
              const categoryCommands = {};
              let commandListText = '';

              events.commands.map(async cmd => {
                if (cmd.dontAddCommandList === false && cmd.pattern !== undefined) {
                  if (!categoryCommands[cmd.category]) {
                    categoryCommands[cmd.category] = [];
                  }
                  categoryCommands[cmd.category].push(cmd.pattern);
                }
              });

              for (const category in categoryCommands) {
                commandListText += '\n╭─❒' + category + '\n';
                for (const pattern of categoryCommands[category]) {
                  commandListText += '├ ' + pattern + '\n';
                }
                commandListText += '╰❒';
              }

              const commandListMessage = categoryCommand.text.replace(/category/gi, commandName).replace(/commands/gi, commandListText);

              processedMessage.reply(commandListMessage, { quoted: message });
            }
          }
        }
      }
    } catch (error) {
      console.log('ERROR  ------------- messages.upsert', error);
    }
  });

  client.ev.on('group-participants.update', async participantUpdate => {
    try {
      let groupUpdate = await groupsg(client, JSON.parse(JSON.stringify(participantUpdate)), true);
      if (!groupUpdate || !groupUpdate.isGroup) {
        return;
      }

      events.commands.map(async command => {
        if (groupUpdate.status === command.group) {
          try {
            command.function(groupUpdate, {
              store: store,
              Void: client,
            });
          } catch (error) {
            console.error('[GROUP PARTICIPANTS ADD ERROR] ', error);
          }
        }
        if (/on|true|main|all|suhail|smd/gi.test(command.group)) {
          try {
            command.function(groupUpdate, {
              store: store,
              Void: client,
            });
          } catch (error) {
            console.error('[GROUP PARTICIPANTS PROMOTE ERROR] ', error);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  client.ev.on('groups.update', async groupUpdates => {
    try {
      for (const groupUpdate of groupUpdates) {
        if (!store.allgroup) {
          store.allgroup = {};
        }
        store.allgroup[groupUpdate.id] = groupUpdate;
      }
    } catch (error) {
      console.log(error);
    }
  });

  client.ev.on('groups.upsert', async groupUpserts => {
    try {
      events.commands.map(async command => {
        if (/on|true|main|all|suhail|smd/gi.test(command.groupsetting || command.upsertgroup || command.groupupsert)) {
          command.function(
            {
              ...groupUpserts[0],
              bot: client,
            },
            {
              store: store,
              Void: client,
              data: groupUpserts,
            }
          );
        }
      });
      await groupsg(client, JSON.parse(JSON.stringify(groupUpserts[0])), false, true);
    } catch (error) {
      console.log(error);
    }
  });

  client.ev.on('contacts.upsert', contacts => {
    try {
      for (const contact of contacts) {
        store.contacts[contact.id] = contact;
      }
    } catch (error) {
      console.error('Error upserting contacts: ', error);
    }
  });

  client.ev.on('contacts.update', async contacts => {
    for (let contact of contacts) {
      let decodedJid = client.decodeJid(contact.id);
      if (store && store.contacts) {
        store.contacts[decodedJid] = {
          id: decodedJid,
          name: contact.notify,
        };
      }
    }
  });

  client.serializeM = message => smsg(client, message, store, false);

  client.ev.on('connection.update', async update => {
    const { connection, lastDisconnect, receivedPendingNotifications, qr } = update;

    global.qr = qr;

    if (qr) {
      try {
        const QRCode = require('qrcode');
        QRCode.toString(qr, (err, qrCodeString) => {
          if (err) {
            console.log(err);
          }
          log(qrCodeString);
        });
      } catch (err) {
        console.error('Error generating QR code: ', err);
      }
    }

    if (connection === 'connecting') {
      log('ℹ️ Connecting to WhatsApp!');
    }

    if (connection === 'open') {
      if (!client.authState.creds?.myAppStateKeyId) {
        client.ev.flush();
      }

      const userId = client.decodeJid(client.user.id);
      const isSuhail = /2348039607375|2349027862116|17863688449/g.test(userId);
      const isCreator = true;

      global.plugin_dir = path.join(__dirname, '../plugins/');

      if (!sqldb) {
        main();
      }

      log('✅ WhatsApp Login Successful!');
      await loadPlugins(plugin_dir);

      let connectionMessage = `
XSTRO MD V${config.VERSION}
Prefix  : [ ${prefix || 'null'} ]
Plugins : ${events.commands.length}
Mode    : ${config.WORKTYPE}
Database: ${sqldb ? 'ServerDB SQL' : 'Local DB'}
`;

      try {
        const scraper = require('./scraper.js');
        let gitSync = await scraper.syncgit();
        if (gitSync.total !== 0) {
          connectionMessage += `
   𝗡𝗲𝘄 𝗨𝗽𝗱𝗮𝘁𝗲
           `;
        }
      } catch (err) {
        console.error('Error checking for updates: ', err);
      }

      global.qr_message = {
        message: 'BOT ALREADY CONNECTED!',
        bot_user: userId,
        connection: connectionMessage.trim(),
      };

      print(connectionMessage);

      await client.sendMessage(
        userId,
        {
          text: `\`\`\`${connectionMessage.trim()}\`\`\``,
        },
        {
          disappearingMessagesInChat: true,
          ephemeralExpiration: 86400,
        }
      );

      global.isStart = true;

      const botInfo = {
        bot: client,
        user: userId,
        isSuhail: isSuhail,
        isCreator: isCreator,
      };

      const extendedInfo = {
        dbbot: false,
        botNumber: userId,
        isCreator: isCreator,
        isSuhail: isSuhail,
        store: store,
        Suhail: botInfo,
        Void: client,
        ...update,
      };

      events.commands.map(async command => {});
    }

    if (connection === 'close') {
      await sleep(5000);
      global.isStart = false;
      global.qr_message = {
        message: 'CONNECTION CLOSED WITH BOT!',
      };

      const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;

      if (statusCode === DisconnectReason.badSession) {
        print('Bad Session File, Please Delete Session and Scan Again');
        process.exit(0);
      } else if (statusCode === DisconnectReason.connectionClosed) {
        print('Connection closed, reconnecting....');
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.connectionLost) {
        print('Connection Lost from Server, reconnecting...');
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.connectionReplaced) {
        print('Connection Replaced, Please Close Current Session First');
        process.exit(1);
      } else if (statusCode === DisconnectReason.loggedOut) {
        print('Device Logged Out, Please Scan Again And Run.');
        process.exit(1);
      } else if (statusCode === DisconnectReason.restartRequired) {
        print('Restart Required, Restarting...');
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.timedOut) {
        print('Connection TimedOut, Reconnecting...');
        syncdb().catch(err => console.log(err));
      } else if (statusCode === DisconnectReason.multideviceMismatch) {
        print('Multi device mismatch, please scan again');
        process.exit(0);
      } else {
        print('Connection closed with bot. Please put New Session ID again.');
        print(statusCode);
        process.exit(0);
      }
    }
  });

  client.ev.on('creds.update', saveCreds);
  client.lastStatus = async () => {
    console.log('last_status :', last_status);
    return last_status;
  };
  client.decodeJid = jid => {
    if (!jid) {
      return jid;
    }
    if (/:\d+@/gi.test(jid)) {
      let decoded = jidDecode(jid) || {};
      return (decoded.user && decoded.server && `${decoded.user}@${decoded.server}`) || jid;
    } else {
      return jid;
    }
  };

  client.getName = async (jid, usePhoneNumber = false) => {
    let decodedJid = client.decodeJid(jid);
    let contactName;
    let phoneNumber = '+' + jid.replace('@s.whatsapp.net', '');

    if (decodedJid.endsWith('@g.us')) {
      return new Promise(async resolve => {
        contactName = store.contacts[decodedJid] || {};
        if (!contactName.name?.notify && !contactName.subject) {
          try {
            contactName = (await client.groupMetadata(decodedJid)) || {};
          } catch (error) {}
        }
        resolve(contactName.subject || contactName.name || phoneNumber);
      });
    } else {
      contactName = decodedJid === '0@s.whatsapp.net' ? { id: decodedJid, name: 'WhatsApp' } : decodedJid === client.decodeJid(client.user.id) ? client.user : store.contacts[decodedJid] || {};
    }

    if (contactName.name || contactName.subject || contactName.verifiedName) {
      return contactName.name || contactName.subject || contactName.verifiedName || phoneNumber;
    } else {
      return userdb
        .findOne({ id: decodedJid })
        .then(result => result.name || phoneNumber)
        .catch(error => phoneNumber);
    }
  };

  client.sendContact = async (chatId, jids, quotedMessageId = '', options = {}) => {
    let contactsArray = [];
    for (let jid of jids) {
      contactsArray.push({
        displayName: await client.getName(jid + '@s.whatsapp.net'),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await client.getName(jid + '@s.whatsapp.net')}\nFN:${global.OwnerName}\nitem1.TEL;waid=${jid}:${jid}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${global.email}\nitem2.X-ABLabel:GitHub\nitem3.URL:${global.github}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${
          global.location
        };;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }

    return client.sendMessage(
      chatId,
      {
        contacts: {
          displayName: `${contactsArray.length} Contact`,
          contacts: contactsArray,
        },
        ...options,
      },
      {
        quoted: quotedMessageId,
      }
    );
  };

  client.setStatus = _0x4e1b1d => {
    client.query({
      tag: 'iq',
      attrs: {
        to: '@s.whatsapp.net',
        type: 'set',
        xmlns: 'status',
      },
      content: [
        {
          tag: 'status',
          attrs: {},
          content: Buffer.from(_0x4e1b1d, 'utf-8'),
        },
      ],
    });
    return _0x4e1b1d;
  };
  client.messageId = (length = 8, prefix = 'WHATSAPP') => {
    const characters = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      prefix += characters.charAt(randomIndex);
    }
    return prefix;
  };

  client.send5ButImg = async (chatId, text, footer, imageBuffer, buttons, thumbnail, options = {}) => {
    let mediaMessage = await prepareWAMessageMedia(
      {
        image: imageBuffer,
        jpegThumbnail: thumbnail,
      },
      {
        upload: client.waUploadToServer,
      }
    );
    let messageContent = generateWAMessageFromContent(
      chatId,
      proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: mediaMessage.imageMessage,
            hydratedContentText: text,
            hydratedFooterText: footer,
            hydratedButtons: buttons,
          },
        },
      }),
      options
    );
    client.relayMessage(chatId, messageContent.message, {
      messageId: client.messageId(),
    });
  };

  client.sendButtonText = (chatId, buttons, text, footer, quotedMessageId = '', options = {}) => {
    let messageOptions = {
      text: text,
      footer: footer,
      buttons: buttons,
      headerType: 2,
      ...options,
    };
    client.sendMessage(chatId, messageOptions, {
      quoted: quotedMessageId,
      ...options,
    });
  };

  client.sendText = (chatId, text, quotedMessageId = '', options = {}) =>
    client.sendMessage(
      chatId,
      {
        text: text,
        ...options,
      },
      {
        quoted: quotedMessageId,
      }
    );

  client.sendImage = async (chatId, image, caption = '', quotedMessageId = '', options = {}) => {
    let imageBuffer = Buffer.isBuffer(image) ? image : /^data:.*?\/.*?;base64,/i.test(image) ? Buffer.from(image.split(',')[1], 'base64') : /^https?:\/\//.test(image) ? await getBuffer(image) : fs.existsSync(image) ? fs.readFileSync(image) : Buffer.alloc(0);
    return await client.sendMessage(
      chatId,
      {
        image: imageBuffer,
        caption: caption,
        ...options,
      },
      {
        quoted: quotedMessageId,
      }
    );
  };

  client.sendTextWithMentions = async (chatId, text, quotedMessageId = '', options = {}) =>
    client.sendMessage(
      chatId,
      {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(match => match[1] + '@s.whatsapp.net'),
        },
        ...options,
      },
      {
        quoted: quotedMessageId,
      }
    );

  client.sendImageAsSticker = async (chatId, image, options = {}) => {
    let stickerUrl;
    if (options && (options.packname || options.author)) {
      stickerUrl = await writeExifImg(image, options);
    } else {
      stickerUrl = await imageToWebp(image);
    }
    await client.sendMessage(
      chatId,
      {
        sticker: {
          url: stickerUrl,
        },
        ...options,
      },
      options
    );
  };

  client.sendVideoAsSticker = async (chatId, video, options = {}) => {
    let stickerUrl;
    if (options && (options.packname || options.author)) {
      stickerUrl = await writeExifVid(video, options);
    } else {
      stickerUrl = await videoToWebp(video);
    }
    await client.sendMessage(
      chatId,
      {
        sticker: {
          url: stickerUrl,
        },
        ...options,
      },
      options
    );
  };

  client.sendMedia = async (chatId, file, fileName = '', caption = '', quotedMessageId = '', options = {}) => {
    let fileData = await client.getFile(file, true);
    let { mime: mimeType, ext: extension, res: response, data: fileBuffer, filename: originalFilename } = fileData;
    if ((response && response.status !== 200) || file.length <= 65536) {
      try {
        throw {
          json: JSON.parse(file.toString()),
        };
      } catch (error) {
        if (error.json) {
          throw error.json;
        }
      }
    }
    let messageType = '';
    let mediaType = mimeType;
    let filename = originalFilename;
    if (options.asDocument) {
      messageType = 'document';
    }
    if (options.asSticker || /webp/.test(mimeType)) {
      let { writeExif } = require('./exif.js');
      let exifResult = {
        mimetype: mimeType,
        data: fileBuffer,
      };
      filename = await writeExif(exifResult, {
        packname: options.packname ? options.packname : config.packname,
        author: options.author ? options.author : config.author,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(originalFilename);
      messageType = 'sticker';
      mediaType = 'image/webp';
    } else if (/image/.test(mimeType)) {
      messageType = 'image';
    } else if (/video/.test(mimeType)) {
      messageType = 'video';
    } else if (/audio/.test(mimeType)) {
      messageType = 'audio';
    } else {
      messageType = 'document';
    }
    await client.sendMessage(
      chatId,
      {
        [messageType]: {
          url: filename,
        },
        caption: caption,
        mimetype: mediaType,
        fileName: fileName,
        ...options,
      },
      {
        quoted: quotedMessageId,
        ...options,
      }
    );
    return fs.promises.unlink(filename);
  };

  client.downloadAndSaveMediaMessage = async (message, filename = 'null', returnBuffer = false, saveToFile = true) => {
    let msg = message.msg ? message.msg : message;
    let mimetype = msg.mimetype || '';
    let mediaType = message.mtype ? message.mtype.split(/Message/gi)[0] : msg.mtype ? msg.mtype.split(/Message/gi)[0] : mimetype.split('/')[0];

    const buffer = await downloadContentFromMessage(msg, mediaType);

    if (returnBuffer) {
      return buffer;
    }

    let fileType = await FileType.fromBuffer(buffer);
    let filePath = './temp/' + filename + '.' + fileType.ext;

    if (saveToFile) {
      fs.writeFileSync(filePath, buffer);
      return filePath;
    }
  };

  client.forward = async (recipients, message, contextInfo, quotedMessage, broadcast = true) => {
    try {
      let messageType = message.mtype;
      let forwardContent = {};
      console.log('Forward function called. Type: ', messageType);

      if (messageType === 'conversation') {
        forwardContent = {
          text: message.text,
          contextInfo: contextInfo,
        };

        for (let recipient of parsedJid(recipients)) {
          await client.sendMessage(recipient, forwardContent, {
            quoted: quotedMessage,
            messageId: client.messageId(),
          });
        }
        return;
      }

      const randomizeFilename = suffix => '' + Math.floor(Math.random() * 10000) + suffix;
      let msg = message.msg ? message.msg : message;
      let mediaType = (message.msg || message).mimetype || '';
      let messageSubtype = message.mtype ? message.mtype.replace(/Message/gi, '') : mediaType.split('/')[0];

      const buffer = await downloadContentFromMessage(msg, messageSubtype);
      let fileBuffer = Buffer.from([]);

      for await (const chunk of buffer) {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
      }

      let fileType = await FileType.fromBuffer(fileBuffer);
      let tempFilePath = './temp/' + randomizeFilename(fileType.ext);

      fs.writeFileSync(tempFilePath, fileBuffer);

      switch (messageType) {
        case 'videoMessage':
          forwardContent = {
            video: fs.readFileSync(tempFilePath),
            mimetype: message.mimetype,
            caption: message.text,
            contextInfo: contextInfo,
          };
          break;
        case 'imageMessage':
          forwardContent = {
            image: fs.readFileSync(tempFilePath),
            mimetype: message.mimetype,
            caption: message.text,
            contextInfo: contextInfo,
          };
          break;
        case 'audioMessage':
          forwardContent = {
            audio: fs.readFileSync(tempFilePath),
            mimetype: message.mimetype,
            seconds: 200001355,
            ptt: true,
            contextInfo: contextInfo,
          };
          break;
        case 'documentWithCaptionMessage':
        case 'documentMessage':
          forwardContent = {
            document: fs.readFileSync(tempFilePath),
            mimetype: message.mimetype,
            caption: message.text,
            contextInfo: contextInfo,
          };
          break;
        default:
          fs.unlink(tempFilePath, err => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully');
            }
          });
      }

      for (let recipient of parsedJid(recipients)) {
        try {
          await client.sendMessage(recipient, forwardContent, {
            quoted: quotedMessage,
            messageId: client.messageId(),
          });
        } catch (error) {
          // Handle send message error
        }
      }

      fs.unlink(tempFilePath, err => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  client.downloadMediaMessage = async message => {
    let msg = message.msg ? message.msg : message;
    let mimetype = (message.msg || message).mimetype || '';
    let mediaType = message.mtype ? message.mtype.replace(/Message/gi, '') : mimetype.split('/')[0];

    const buffer = await downloadContentFromMessage(msg, mediaType);
    let fileBuffer = Buffer.from([]);

    for await (const chunk of buffer) {
      fileBuffer = Buffer.concat([fileBuffer, chunk]);
    }

    return fileBuffer;
  };

  client.forwardOrBroadcast2 = async (recipients, message, contextInfo = {}, specialCase = '') => {
    try {
      let messageType = message.mtype;

      if (messageType === 'videoMessage' && specialCase === 'ptv') {
        message = {
          ptvMessage: {
            ...message.msg,
          },
        };
      }

      let options = {
        ...contextInfo,
        contextInfo: {
          ...(contextInfo.contextInfo ? contextInfo.contextInfo : {}),
          ...(contextInfo.linkPreview
            ? {
                linkPreview: {
                  ...contextInfo.linkPreview,
                },
              }
            : {}),
          ...(contextInfo.quoted && contextInfo.quoted.message
            ? {
                quotedMessage: {
                  ...(contextInfo.quoted?.message || {}),
                },
              }
            : {}),
        },
      };

      let content = message.message ? message.message : message;
      let mediaType = messageType ? messageType : Object.keys(content)[0];
      content = {
        ...options,
        ...content,
      };

      const waMessage = await generateWAMessageFromContent(
        recipients,
        content,
        contextInfo
          ? {
              ...(mediaType == 'conversation'
                ? {
                    extendedTextMessage: {
                      text: content[mediaType],
                    },
                  }
                : content[mediaType]),
              ...options,
              contextInfo: {
                ...(content[mediaType]?.contextInfo || {}),
                ...options.contextInfo,
              },
            }
          : {}
      );

      await client.relayMessage(recipients, waMessage.message, {
        messageId: client.messageId(),
      });

      return waMessage;
    } catch (error) {}
  };

  client.forwardOrBroadcast = async (recipients, message, options = {}, specialCase = '') => {
    try {
      if (!options || typeof options !== 'object') {
        options = {};
      }

      options.messageId = options.messageId || client.messageId();
      let content = message.message ? message.message : message;
      let messageType = content.mtype ? content.mtype : Object.keys(content)[0];

      if (messageType === 'videoMessage' && specialCase === 'ptv') {
        content = {
          ptvMessage: {
            ...message.msg,
          },
        };
        messageType = 'ptvMessage';
      } else if (messageType === 'conversation') {
        content = {
          extendedTextMessage: {
            text: content[messageType],
          },
        };
        messageType = 'extendedTextMessage';
      }

      content[messageType] = {
        ...(content[messageType] || content),
        ...options,
      };

      const waMessage = generateWAMessageFromContent(recipients, content, options);

      await client.relayMessage(recipients, waMessage.message, {
        messageId: options.messageId,
      });

      return waMessage;
    } catch (error) {
      console.error(error);
    }
  };

  client.forwardMessage = client.forwardOrBroadcast;
  client.copyNForward = async (recipients, message, readViewOnce = false, options = {}) => {
    try {
      let key;
      if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : message.message || undefined;
        key = Object.keys(message.message.viewOnceMessage.message)[0];
        delete (message.message && message.message.ignore ? message.message.ignore : message.message || undefined);
        message.message = {
          ...message.message.viewOnceMessage.message,
        };
      }

      let messageType = Object.keys(message.message)[0];

      try {
        options.key.fromMe = true;
      } catch (error) {}

      let forwardContent = await generateForwardMessageContent(message, readViewOnce);
      let messageKey = Object.keys(forwardContent)[0];
      let contextInfo = {};

      if (messageType !== 'conversation') {
        contextInfo = message.message[messageType].contextInfo;
      }

      forwardContent[messageKey].contextInfo = {
        ...contextInfo,
        ...forwardContent[messageKey].contextInfo,
      };

      const waMessage = await generateWAMessageFromContent(recipients, forwardContent, options);

      await client.relayMessage(recipients, waMessage.message, {
        messageId: client.messageId(),
      });

      return waMessage;
    } catch (error) {
      console.error(error);
    }
  };

  client.sendFileUrl = async (
    chatId,
    url,
    caption = '',
    quotedMessageId = '',
    options = {
      author: 'Xstro',
    },
    fileTypeOverride = ''
  ) => {
    try {
      const response = await axios.head(url);
      const contentType = response?.headers['content-type'] || '';
      const mediaType = contentType.split('/')[0];

      let messageContent = null;

      if (contentType.split('/')[1] === 'gif' || fileTypeOverride === 'gif') {
        messageContent = {
          video: { url },
          caption,
          gifPlayback: true,
          ...options,
        };
      } else if (contentType.split('/')[1] === 'webp' || fileTypeOverride === 'sticker') {
        messageContent = {
          sticker: { url },
          ...options,
        };
      } else if (mediaType === 'image' || fileTypeOverride === 'image') {
        messageContent = {
          image: { url },
          caption,
          ...options,
          mimetype: 'image/jpeg',
        };
      } else if (mediaType === 'video' || fileTypeOverride === 'video') {
        messageContent = {
          video: { url },
          caption,
          mimetype: 'video/mp4',
          ...options,
        };
      } else if (mediaType === 'audio' || fileTypeOverride === 'audio') {
        messageContent = {
          audio: { url },
          mimetype: 'audio/mpeg',
          ...options,
        };
      } else if (contentType === 'application/pdf') {
        messageContent = {
          document: { url },
          mimetype: 'application/pdf',
          caption,
          ...options,
        };
      }

      if (messageContent) {
        try {
          return await client.sendMessage(chatId, messageContent, {
            quoted: quotedMessageId,
          });
        } catch {}
      }

      // Handle unknown file types based on content disposition
      try {
        const fileName = response?.headers['content-disposition']?.split('="')[1]?.split('"')[0] || 'file';
        const imageExtensions = ['.jpg', '.jpeg', '.png'];
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.gif', '.m4v', '.webp'];
        let detectedMimeType = 'application/octet-stream';

        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        if (imageExtensions.includes(fileExtension)) {
          detectedMimeType = 'image/jpeg';
        } else if (videoExtensions.includes(fileExtension)) {
          detectedMimeType = 'video/mp4';
        }

        // Use detected mime type if available, otherwise fallback to original content type
        const finalMimeType = detectedMimeType ? detectedMimeType : contentType;

        const fileMessage = {
          fileName: fileName || 'file',
          caption,
          ...options,
          mimetype: finalMimeType,
        };

        return await client.sendMessage(
          chatId,
          {
            document: { url },
            ...fileMessage,
          },
          {
            quoted: quotedMessageId,
          }
        );
      } catch (error) {
        console.error('Error handling file type:', error);
      }

      // Fallback to default handling
      const defaultMessage = {
        fileName: 'file',
        caption,
        ...options,
        mimetype: contentType,
      };

      return await client.sendMessage(
        chatId,
        {
          document: { url },
          ...defaultMessage,
        },
        {
          quoted: quotedMessageId,
        }
      );
    } catch (error) {
      console.error('Error in client.sendFileUrl():', error);
      throw error;
    }
  };

  client.sendFromUrl = client.sendFileUrl;

  const knownImageExtensions = ['.jpg', '.jpeg', '.png'];
  const knownVideoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.gif', '.m4v', '.webp'];

  client.sendUi = async (chatId, content, quotedMessage, fileType, userImages, isStyleGreaterZero) => {
    let mediaData = {};

    try {
      if (!_0x51034c.length || !_0x51034c[0]) {
        _0x51034c = global.userImages ? global.userImages.split(',') : [await botpic()];
        _0x51034c = _0x51034c.filter(image => image.trim() !== '');
      }

      const selectedImage = fileType && userImages ? userImages : _0x51034c[Math.floor(Math.random() * _0x51034c.length)];

      if (!_0x29f5c5[selectedImage]) {
        const extension = selectedImage.substring(selectedImage.lastIndexOf('.')).toLowerCase();
        const isImage = knownImageExtensions.includes(extension);
        const isVideo = knownVideoExtensions.includes(extension);

        _0x29f5c5[selectedImage] = {
          image: isImage,
          video: isVideo,
        };
      }

      quotedMessage = quotedMessage && quotedMessage.quoted?.key ? quotedMessage.quoted : quotedMessage || '';

      if (((isStyleGreaterZero && userImages && global.style > 0) || !userImages) && fileType === 'text') {
        mediaData = {
          text: content.text || content.caption,
          ...content,
        };
      } else if (fileType === 'image' || _0x29f5c5[selectedImage].image) {
        mediaData = {
          image: {
            url: selectedImage,
          },
          ...content,
          mimetype: 'image/jpeg',
        };
      } else if (fileType === 'video' || _0x29f5c5[selectedImage].video) {
        mediaData = {
          video: {
            url: selectedImage,
          },
          ...content,
          mimetype: 'video/mp4',
          gifPlayback: true,
          height: 274,
          width: 540,
        };
      }

      const context = isStyleGreaterZero && userImages && global.style > 0 ? await smdBuffer(userImages) : null;

      const contextInfo = {
        ...(await client.contextInfo(config.botname, quotedMessage.senderName ? quotedMessage.senderName : config.ownername, context)),
      };

      if (mediaData) {
        return await client.sendMessage(
          chatId,
          {
            contextInfo,
            ...mediaData,
          },
          {
            quoted: quotedMessage,
          }
        );
      }
    } catch (error) {
      console.error('Error in sendUi:', error);
    }

    try {
      // Fallback when unable to process mediaData
      return await client.sendMessage(chatId, {
        image: {
          url: await botpic(),
        },
        contextInfo,
        ...content,
      });
    } catch {
      // Fallback to text message if image fallback also fails
      return client.sendMessage(chatId, {
        text: content.text || content.caption,
        ...content,
      });
    }
  };
  client.contextInfo = async (botName = config.botname, ownerName = config.ownername, log = log0, style = global.style, url = gurl, isForwarded = false) => {
    try {
      let externalAdReply = {
        title: botName,
        body: ownerName,
        thumbnail: log || log0,
        mediaType: 1,
        mediaUrl: url,
        sourceUrl: url,
      };

      if (style >= 5) {
        externalAdReply = {
          ...externalAdReply,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        };
      } else if (style === 4) {
        externalAdReply = {
          ...externalAdReply,
          forwardingScore: 999,
          isForwarded: true,
        };
      }

      return { externalAdReply };
    } catch (error) {
      console.error('Error in client.contextInfo:', error);
      return {};
    }
  };

  client.cMod = (newJid, messageObj, newText = '', participantId = client.user.id, extraOptions = {}) => {
    let messageKey = Object.keys(messageObj.message)[0];
    let isEphemeral = messageKey === 'ephemeralMessage';

    if (isEphemeral) {
      messageKey = Object.keys(messageObj.message.ephemeralMessage.message)[0];
    }

    let messageContent = isEphemeral ? messageObj.message.ephemeralMessage.message : messageObj.message;
    let contentToUpdate = messageContent[messageKey];

    if (typeof contentToUpdate === 'string') {
      messageContent[messageKey] = newText || contentToUpdate;
    } else if (contentToUpdate.caption) {
      contentToUpdate.caption = newText || contentToUpdate.caption;
    } else if (contentToUpdate.text) {
      contentToUpdate.text = newText || contentToUpdate.text;
    }

    if (typeof contentToUpdate !== 'string') {
      messageContent[messageKey] = {
        ...contentToUpdate,
        ...extraOptions,
      };
    }

    if (messageObj.key.participant) {
      participantId = messageObj.key.participant = participantId || messageObj.key.participant;
    } else if (messageObj.key.remoteJid.includes('@s.whatsapp.net') || messageObj.key.remoteJid.includes('@broadcast')) {
      participantId = participantId || messageObj.key.remoteJid;
    }

    messageObj.key.remoteJid = newJid;
    messageObj.key.fromMe = participantId === client.user.id;

    return proto.WebMessageInfo.fromObject(messageObj);
  };
  client.getFile = async (fileUrlOrPath, saveToFile = false) => {
    let fileBuffer;

    if (Buffer.isBuffer(fileUrlOrPath)) {
      fileBuffer = fileUrlOrPath;
    } else if (/^data:.*?\/.*?;base64,/i.test(fileUrlOrPath)) {
      fileBuffer = Buffer.from(fileUrlOrPath.split(',')[1], 'base64');
    } else if (/^https?:\/\//.test(fileUrlOrPath)) {
      fileBuffer = await getBuffer(fileUrlOrPath);
    } else if (fs.existsSync(fileUrlOrPath)) {
      fileBuffer = fs.readFileSync(fileUrlOrPath);
    } else if (typeof fileUrlOrPath === 'string') {
      fileBuffer = Buffer.alloc(0); // Handle other types of strings as needed
    }

    const fileInfo = (await FileType.fromBuffer(fileBuffer)) || {
      mime: 'application/octet-stream',
      ext: '.bin',
    };

    let filePath = './temp/null.' + fileInfo.ext;

    if (fileBuffer && saveToFile) {
      await fs.promises.writeFile(filePath, fileBuffer);
    }

    return {
      res: fileBuffer,
      filename: filePath,
      size: getSizeMedia(fileBuffer),
      ...fileInfo,
      data: fileBuffer,
    };
  };
  client.sendFile = async (chatId, fileUrlOrPath, fileName, quotedMessage = { quoted: '' }, options = {}) => {
    const fileDetails = await client.getFile(fileUrlOrPath, true);

    let { filename, size, ext, mime, data } = fileDetails;
    let fileType = '';
    let fileMimeType = mime;
    let fileCaption = filename;

    if (options.asDocument) {
      fileType = 'document';
    } else if (options.asSticker || /webp/.test(mime)) {
      const { writeExif } = require('./exif.js');
      const exifOptions = {
        packname: config.packname,
        author: config.packname,
        categories: options.categories ? options.categories : [],
      };
      fileCaption = await writeExif({ mimetype: mime, data }, exifOptions);
      await fs.promises.unlink(filename);
      fileType = 'sticker';
      fileMimeType = 'image/webp';
    } else if (/image/.test(mime)) {
      fileType = 'image';
    } else if (/video/.test(mime)) {
      fileType = 'video';
    } else if (/audio/.test(mime)) {
      fileType = 'audio';
    } else {
      fileType = 'document';
    }

    await client.sendMessage(
      chatId,
      {
        [fileType]: {
          url: fileCaption,
        },
        mimetype: fileMimeType,
        fileName: fileName,
        ...options,
      },
      {
        quoted: quotedMessage.quoted ? quotedMessage.quoted : quotedMessage,
        ...quotedMessage,
      }
    );

    return fs.promises.unlink(fileCaption);
  };

  client.fakeMessage = async (messageType = 'text', options = {}, content = '➬ Suhail SER', extraParams = {}) => {
    const randomNumbers = [777, 0, 100, 500, 1000, 999, 2021];

    let messageContent = {};

    switch (messageType) {
      case 'text':
      case 'conservation':
      case '':
        messageContent = {
          conversation: content,
        };
        break;
      case 'order':
        messageContent = {
          orderMessage: {
            itemCount: randomNumbers[Math.floor(Math.random() * randomNumbers.length)],
            status: 1,
            surface: 1,
            message: '❏ ' + content,
            orderTitle: 'live',
            sellerJid: '2348039607375@s.whatsapp.net',
          },
        };
        break;
      case 'contact':
        messageContent = {
          contactMessage: {
            displayName: '' + content,
            jpegThumbnail: log0,
          },
        };
        break;
      case 'image':
        messageContent = {
          imageMessage: {
            jpegThumbnail: log0,
            caption: content,
          },
        };
        break;
      case 'video':
        messageContent = {
          videoMessage: {
            url: log0,
            caption: content,
            mimetype: 'video/mp4',
            fileLength: '4757228',
            seconds: 44,
          },
        };
        break;
      default:
        break;
    }

    return {
      key: {
        id: client.messageId(),
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        ...options,
      },
      message: {
        ...messageContent,
        ...extraParams,
      },
    };
  };
  client.interactiveMessage = async (jid, options) => {
    const { title, text, footer, buttons, image, video } = options;
    const message = {};

    if (title) message.title = title;
    if (text) message.text = text;
    if (footer) message.footer = footer;

    if (image) {
      message.imageMessage = {
        jpegThumbnail: image,
      };
    }

    if (video) {
      message.videoMessage = {
        url: video,
        mimetype: 'video/mp4',
        fileLength: '4757228', // Example file length
        seconds: 60, // video duration
      };
    }

    if (buttons && buttons.length > 0) {
      message.buttons = buttons.map(button => {
        switch (button.type) {
          case 'button':
            return {
              buttonMessage: {
                buttonId: button.id,
                buttonText: button.display_text,
              },
            };
          case 'url':
            return {
              urlMessage: {
                url: button.url,
                displayText: button.display_text,
              },
            };
          case 'address':
            return {
              locationMessage: {
                address: button.display_text,
                addressJid: button.id,
              },
            };
          case 'location':
            return {
              locationMessage: {
                live: true,
              },
            };
          case 'copy':
            return {
              buttonsMessage: {
                buttonText: button.display_text,
                buttonId: button.id,
                contextInfo: {
                  stanzaId: 'message',
                  participant: '0@s.whatsapp.net',
                },
              },
            };
          case 'call':
            return {
              buttonsMessage: {
                buttonText: button.display_text,
                buttonId: button.id,
                contextInfo: {
                  stanzaId: 'message',
                  participant: '0@s.whatsapp.net',
                  remoteJid: button.phone_number + '@s.whatsapp.net',
                },
              },
            };
          case 'list':
            return {
              listMessage: {
                title: button.maintitle,
                description: button.header,
                buttonText: button.title,
                sectionIdentifier: button.id,
              },
            };
          default:
            return null;
        }
      });
    }

    const fakeMessage = client.fakeMessage('text', {}, `${title}`, message);
    await client.sendMessage(jid, fakeMessage.message, 'extendedTextMessage', { quoted: { key: fakeMessage.key } });
  };

  client.parseMention = async message => {
    const mentionRegex = /@([0-9]{5,16}|0)/g;
    const matches = [...message.matchAll(mentionRegex)];
    return matches.map(match => match[1] + '@s.whatsapp.net');
  };

  app.get('/chat', (req, res) => {
    let chatId = req.query.chat || req.query.jid || client.user.id || client.user.m || '';

    if (['all', 'msg', 'total'].includes(chatId)) {
      return res.json({
        chat: chatId,
        conversation: JSON.stringify(store, null, 2),
      });
    }

    if (!chatId) {
      return res.json({
        ERROR: 'Chat Id parameter missing',
      });
    }

    chatId = client.decodeJid(chatId);

    const messages = store.messages[chatId] || store.messages[chatId + '@s.whatsapp.net'] || store.messages[chatId + '@g.us'];

    if (!messages?.array) {
      return res.json({
        chat: chatId,
        Message: 'No messages found in given chat id!',
      });
    }

    res.json({
      chat: chatId,
      conversation: JSON.stringify(messages.array, null, 2),
    });
  });
  client.dl_size = global.dl_size || 200;

  client.awaitForMessage = async (options = {}) => {
    return new Promise((resolve, reject) => {
      if (typeof options !== 'object') {
        reject(new Error('Options must be an object'));
        return;
      }

      if (typeof options.sender !== 'string') {
        reject(new Error('Sender must be a string'));
        return;
      }

      if (typeof options.remoteJid !== 'string') {
        reject(new Error('ChatJid must be a string'));
        return;
      }

      if (options.timeout && typeof options.timeout !== 'number') {
        reject(new Error('Timeout must be a number'));
        return;
      }

      if (options.filter && typeof options.filter !== 'function') {
        reject(new Error('Filter must be a function'));
        return;
      }

      const timeout = options.timeout || undefined;
      const messageFilter = options.filter || (() => true);

      let timeoutId;
      let messageListener = message => {
        const { type, messages } = message;

        if (type === 'notify') {
          for (let msg of messages) {
            const fromMe = msg.key.fromMe;
            const remoteJid = msg.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            const isStatus = remoteJid === 'status@broadcast';
            const participant = fromMe ? client.user.id : isGroup || isStatus ? msg.key.participant : remoteJid;
            const decodedParticipant = client.decodeJid(participant);

            if (decodedParticipant === options.sender && remoteJid === options.remoteJid && messageFilter(msg)) {
              client.ev.off('messages.upsert', messageListener);
              clearTimeout(timeoutId);
              resolve(msg);
            }
          }
        }
      };

      client.ev.on('messages.upsert', messageListener);

      if (timeout) {
        timeoutId = setTimeout(() => {
          client.ev.off('messages.upsert', messageListener);
          reject(new Error('Timeout'));
        }, timeout);
      }
    });
  };

  return client;
}
let asciii = '\n\n                ' + config.VERSION + '\n  𝗠𝗨𝗟𝗧𝗜𝗗𝗘𝗩𝗜𝗖𝗘 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗨𝗦𝗘𝗥 𝗕𝗢𝗧\n\n';
console.log(asciii);
global.lib_dir = __dirname;
global.toBool = (input, defaultValue = false) => {
  const truthyRegex = /true|yes|ok|act|sure|enable|smd|suhail/gi;

  if (truthyRegex.test(input)) {
    return defaultValue ? true : 'true';
  } else {
    return defaultValue ? false : 'false';
  }
};

async function loadPlugins(directoryPath) {
  try {
    fs.readdirSync(directoryPath).forEach(file => {
      const filePath = path.join(directoryPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        loadPlugins(filePath);
      } else if (file.includes('_Baileys') || file.includes('_MSGS')) {
        log(`Bot Sharing Found!`);
      } else if (['.js', '.smd'].includes(path.extname(file).toLowerCase())) {
        try {
          require(filePath);
        } catch (error) {
          log(`\nThere's an error in '${file}' file\n\n`, error);
        }
      }
    });
  } catch (error) {
    // Handle any errors if needed
  }
}

const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Xstro</title>
            <link rel="icon" type="image/png" sizes="32x32" href="/logo">
          </head>
          <body>
            <section>
              Xstro Running...
            </section>
          </body> 
        </html>
   `;

app.set('json spaces', 3);

// Route for serving index.html if it exists in 'assets' directory
app.get('/', (req, res) => {
  try {
    let indexPath = path.join(__dirname, 'assets', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.type('html').send(html); // Assuming 'html' is defined somewhere in your code
    }
  } catch (error) {
    console.error('Error serving / route:', error);
  }
});

// Route for serving 'html' content on '/app'
app.get('/app', (req, res) => {
  res.type('html').send(html); // Assuming 'html' is defined somewhere in your code
});

// Route for serving JSON data on '/var'
app.get('/var', (req, res) => {
  res.json({
    ...config,
    SESSION_ID: SESSION_ID,
  });
});

// Route for serving QR code image buffer on '/qr'
app.get('/qr', async (req, res) => {
  try {
    if (!global.qr) {
      throw new Error('QR NOT FETCHED!');
    }
    let qrcode = require('qrcode');
    res.end(await qrcode.toBuffer(global.qr));
  } catch (error) {
    console.error('/qr PATH_URL Error:', error);
    if (!res.headersSent) {
      res.send({
        error: error.message || error,
        reason: global.qr_message || 'SERVER DOWN!',
        uptime: runtime(process.uptime()),
      });
    }
  }
});

// Route for serving global 'log0' content on '/logo'
app.get('/logo', (req, res) => {
  res.end(global.log0);
});

let quickport = global.port ? global.port : Math.floor(Math.random() * 9000) + 1000;

app.listen(quickport, () => console.log(`Suhail-Md Server listening on http://localhost:${quickport}/`));

global.print = console.log;
global.log = console.log;
global.Debug = {
  ...console,
};

if (!/true|log|error|logerror|err|all|info|loginfo|warn|logwarn/.test(global.MsgsInLog)) {
  console.log = () => {};
}

if (!/error|logerror|err|all/.test(global.MsgsInLog)) {
  console.error = () => {};
}

if (!/info|loginfo|all/.test(global.MsgsInLog)) {
  console.info = () => {};
}

if (!/warn|logwarn|all/.test(global.MsgsInLog)) {
  console.warn = () => {};
}

let Appurls = [];

if (global.appUrl && /http/gi.test(global.appUrl)) {
  Appurls = [global.appUrl, `http://localhost:${quickport}`];
}

if (process.env.REPL_ID) {
  Appurls.push(`https://${process.env.REPL_ID}.pike.replit.dev`);
  Appurls.push(`https://${process.env.REPL_ID}.${process.env.REPLIT_CLUSTER || 'pike'}.replit.dev`);
}

if (process.env.REPL_SLUG) {
  Appurls.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
}

if (process.env.PROJECT_DOMAIN) {
  Appurls.push(`https://${process.env.PROJECT_DOMAIN}.glitch.me`);
}

if (process.env.CODESPACE_NAME) {
  Appurls.push(`https://${process.env.CODESPACE_NAME}.github.dev`);
}

function keepAlive() {
  setInterval(() => {
    for (let i = 0; i < Appurls.length; i++) {
      const url = Appurls[i];
      if (/(\/\/|\.)undefined\./.test(url)) {
        continue;
      }
      try {
        axios.get(url);
      } catch (error) {
        console.error(`Error fetching ${url} with axios:`, error);
      }
      try {
        fetch(url);
      } catch (error) {
        console.error(`Error fetching ${url} with fetch:`, error);
      }
    }
  }, 300000); // 300000 milliseconds = 5 minutes
}

if (Array.isArray(Appurls)) {
  keepAlive();
}

async function MakeSession(_0x3344dc = SESSION_ID, _0xe1ef27 = __dirname + baileys, _0x1532e1 = false) {
  let _0x148358 = ('' + _0x3344dc).replace(/Session;;;/gi, '').trim();
  function _0x279b36(_0x321840) {
    return Buffer.from(_0x321840, 'base64').toString('utf-8');
  }
  function _0x28b1d6(_0x26cc18, _0xb70989) {
    return new Promise((_0x464e85, _0x3502fc) => {
      fs.readFile(_0xb70989, 'utf8', (_0x33dd62, _0x53263f) => {
        if (_0x33dd62) {
          _0x464e85(false);
        } else {
          _0x464e85(_0x53263f.includes(_0x26cc18));
        }
      });
    });
  }
  const _0x406ff0 = '/AstroFx0011/';
  const _0x40fbb4 = toBool(_0x1532e1, true) || (await _0x28b1d6(_0x406ff0, './Dockerfile'));
  if (_0x40fbb4) {
    if (!fs.existsSync(_0xe1ef27)) {
      fs.mkdirSync(_0xe1ef27);
      try {
        log('Checking Session ID!');
        var _0x395cbc = _0x279b36(_0x148358);
        const _0x4b3148 = JSON.parse(_0x395cbc);
        if (_0x4b3148['creds.json']) {
          for (const _0x1d12b5 in _0x4b3148) {
            try {
              fs.writeFileSync(_0xe1ef27 + _0x1d12b5, typeof _0x4b3148[_0x1d12b5] == 'string' ? _0x4b3148[_0x1d12b5] : JSON.stringify(_0x4b3148[_0x1d12b5], null, 2));
            } catch (_0x1d9fd6) {}
          }
        } else {
          fs.writeFileSync(_0xe1ef27 + 'creds.json', JSON.stringify(_0x4b3148, null, 2));
        }
        log('\nCredentials Saved Successfully.');
      } catch (_0x5cc9c4) {
        log('Session Error', _0x5cc9c4);
      }
    }
  } else {
    log('Deploy From : https://github.com' + _0x406ff0 + 'Xstro\n');
    process.exit(0);
  }
}

async function main() {
  if (global.DATABASE_URL && !['false', 'null'].includes(global.DATABASE_URL)) {
    try {
      global.sqldb = await startDb();
    } catch {}
  }
}
module.exports = {
  init: MakeSession,
  connect: syncdb,
  logger: global.Debug,
  DATABASE: {
    sync: main,
  },
};
