const os = require('os');
const config = require('../config');
let { fancytext, tlang, tiny, runtime, formatp, prefix } = require('../lib');
const { commands } = require('../lib');
const { exec } = require('child_process');
const translatte = require('translatte');

async function fetchCategory(client) {
  try {
    const categoryMap = {};
    commands.forEach(cmd => {
      if (cmd.dontAddCommandList === false && cmd.pattern !== undefined) {
        if (!categoryMap[cmd.category]) {
          categoryMap[cmd.category] = [];
        }
        categoryMap[cmd.category].push(cmd.pattern);
      }
    });
    let message = '\t *_ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴀᴛᴇɢᴏʀʏ ᴍᴇɴᴜꜱ_*';

    for (const category in categoryMap) {
      message += `\n*${tiny(category.toLowerCase())} ᴍᴇɴᴜ*\n`;
    }
    return await client.sendUi(client.jid, {
      caption: message,
    });
  } catch (error) {
    await client.error(error + '\nCommand:help', error);
  }
}

async function pingPong(client) {
  var startTime = new Date().getTime();
  const { key: editKey } = await client.reply('*ꜱᴇʀᴠᴇʀ ᴄʜᴇᴄᴋ...*');
  var endTime = new Date().getTime();
  return await client.send('*ᴘᴏɴɢ!*\n*ʟᴀᴛᴇɴᴄʏ ' + (endTime - startTime) + ' ᴍꜱ* ', { edit: editKey });
}
async function getUptime(client) {
  try {
    client.reply('*_Running Since ' + runtime(process.uptime()) + '_*');
  } catch (error) {
    await client.error(error + '\n\ncommand : uptime', error, false);
  }
}

async function getallMenu(client, message) {
  try {
    const { commands } = require('../lib');
    const categoryCommandsMap = {};

    // Group commands by category
    commands.forEach(cmd => {
      if (!categoryCommandsMap[cmd.category]) {
        categoryCommandsMap[cmd.category] = [];
      }
      categoryCommandsMap[cmd.category].push(cmd.pattern);
    });

    let menuText = `
╭══ xꜱᴛʀᴏ ʙᴏᴛ ═══⊷
│ \`\`\`Owner\`\`\` ${config.ownername}
│ \`\`\`Plugins\`\`\` ${commands.length}
│ \`\`\`Alive\`\`\` ${runtime(process.uptime())}
│ \`\`\`Ram\`\`\` ${formatp(os.totalmem() - os.freemem())}
│ \`\`\`Time\`\`\` ${client.time}
│ \`\`\`Date\`\`\` ${client.date}
│ \`\`\`Version\`\`\` ${config.VERSION}
╰════════════⊷\n`;

    // Append commands for each category
    for (const category in categoryCommandsMap) {
      menuText += `╭══ ${tiny(category)} ══⊷\n`;
      for (const command of categoryCommandsMap[category]) {
        menuText += `│ ${tiny(command, 1)}\n`;
      }
      menuText += `╰════════════⊷\n`;
    }
    menuText += '\t xꜱᴛʀᴏ ᴍᴅ ʙᴏᴛ';
    let options = {
      caption: menuText.trim(), // Trim any extra whitespace at the beginning and end
    };
    // Send the menu as a UI message
    return await client.sendUi(client.chat, options, client);
  } catch (error) {
    await client.error(error + '\nCommand:menu', error);
  }
}

async function listCommandDesc(client) {
  try {
    const { commands } = require('../lib');

    let menuText = `*_ʙᴇʟᴏᴡ ᴀʀᴇ ᴄᴏᴍᴍᴀɴᴅs ᴅᴇsᴄʀɪᴘᴛɪᴏɴs_*\n\n`;

    for (let i = 0; i < commands.length; i++) {
      if (commands[i].pattern === undefined) {
        continue;
      }
      menuText += `*${i + 1} ${fancytext(commands[i].pattern, 1)}*\n`;
      menuText += `  ${fancytext(commands[i].desc, 1)}\n`;
    }

    let options = {
      caption: `\n${menuText.trim()}${config.caption}`,
    };

    return await client.sendUi(client.chat, options);
  } catch (error) {
    await client.error(`${error}\nCommand:list`, error);
  }
}

async function sendOwnerContact(client) {
  try {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownername}\nORG:;\nTEL;type=CELL;type=VOICE;waid=${global.owner?.split(',')[0]}:+${global.owner?.split(',')[0]}\nEND:VCARD`;

    let messageOptions = {
      contacts: {
        displayName: config.ownername,
        contacts: [
          {
            vcard: vcard,
          },
        ],
      },
      contextInfo: {
        externalAdReply: {
          title: config.ownername,
          body: 'Touch here.',
          renderLargerThumbnail: true,
          thumbnailUrl: '',
          thumbnail: log0,
          mediaType: 1,
          mediaUrl: '',
          sourceUrl: `https://wa.me/+${global.owner?.split(',')[0]}?text=Hii+${config.ownername}`,
        },
      },
    };

    return await client.sendMessage(client.jid, messageOptions, {
      quoted: client,
    });
  } catch (error) {
    await client.error(`${error}\nCommand:owner`, error);
  }
}

async function translateLanguage(client, message) {
  try {
    let targetLanguage = message ? message.split(' ')[0].toLowerCase() : 'en';
    let textToTranslate;

    if (!client.reply_text) {
      textToTranslate = message.replace(targetLanguage, '').trim() || false;
    } else {
      textToTranslate = client.reply_text;
    }

    if (!textToTranslate) {
      return await client.reply(`*I Need Text, ${prefix}translate en Bonjour Astro*`);
    }

    const translationResult = await translatte(textToTranslate, {
      from: 'auto',
      to: targetLanguage,
    });

    if ('text' in translationResult) {
      return await client.reply(translationResult.text);
    }
  } catch (error) {
    await client.error(`${error}\n\ncommand trt`, error);
  }
}

async function excuteCode(client, query, { isCreator, cmdName, Void }) {
  try {
    if (!query) {
      return client.reply('*_Provide Vaild Function To Excute_*');
    }

    let result = eval(`const executeQuery = async () => {\n${query}\n}; executeQuery();`);

    if (typeof result === 'object') {
      await client.reply(JSON.stringify(result));
    } else {
      await client.reply(result.toString());
    }
  } catch (error) {
    return await client.reply(error.toString());
  }
}

async function runConsole(client, command) {
  try {
    if (!client.isCreator) {
      return client.reply(tlang().owner);
    }
    if (!command) {
      return client.reply('*_Give me Terminal Command For Node Process_*');
    }
    exec(command, (error, stdout) => {
      const response = `----*_Results_*----\n\n`;
      if (error) {
        return client.reply(response + error);
      }
      if (stdout) {
        return client.reply(response + stdout);
      }
    });
  } catch (error) {
    await client.error(`${error}\n\ncommand shell`, error);
  }
}

module.exports = {
  fetchCategory,
  pingPong,
  getUptime,
  getallMenu,
  listCommandDesc,
  sendOwnerContact,
  translateLanguage,
  excuteCode,
  runConsole,
};
