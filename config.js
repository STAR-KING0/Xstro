const fs = require('fs-extra');
if (fs.existsSync('.env')) require('dotenv').config({ path: __dirname + '/config.env' });

global.devs = '2348039607375';
global.sudo = process.env.SUDO ? process.env.SUDO.replace(/[\s+]/g, '') : 'null';
global.owner = process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.replace(/[\s+]/g, '') : '2348039607375';

global.port = process.env.PORT;
global.appUrl = process.env.APP_URL || '';
global.email = 'samsamsun789@gmail.com';
global.location = 'Lahore,Pakistan.';

global.mongodb = process.env.MONGODB_URI || '';
global.allowJids = process.env.ALLOW_JID || 'null';
global.blockJids = process.env.BLOCK_JID || 'null';
global.DATABASE_URL = process.env.DATABASE_URL || '';

global.timezone = process.env.TIME_ZONE || 'Asia/Karachi';
global.github = process.env.GITHUB || 'https://github.com/SuhailTechInfo/Suhail-Md';
global.gurl = process.env.GURL || 'https://whatsapp.com/channel/0029Va9thusJP20yWxQ6N643';
global.website = process.env.GURL || 'https://whatsapp.com/channel/0029Va9thusJP20yWxQ6N643';
global.THUMB_IMAGE = process.env.THUMB_IMAGE || 'https://telegra.ph/file/d5b1c3544fedc23e11a06.jpg';

global.flush = process.env.FLUSH || 'false';
global.gdbye = process.env.GOODBYE || 'false';
global.wlcm = process.env.WELCOME || 'false';

global.disablepm = process.env.DISABLE_PM || 'false';
global.disablegroup = process.env.DISABLE_GROUPS || 'false';
global.userImages = process.env.USER_IMAGES || '';
global.waPresence = process.env.WAPRESENCE || 'set according to your need';
global.readcmds = process.env.READ_COMMAND || 'false';
global.readmessage = process.env.READ_MESSAGE || 'false';
global.read_status = process.env.AUTO_READ_STATUS || 'false';
global.save_status = process.env.AUTO_SAVE_STATUS || 'false';
global.save_status_from = process.env.SAVE_STATUS_FROM || 'null';
global.read_status_from = process.env.READ_STATUS_FROM || 'null';


global.SESSION_ID = process.env.SESSION_ID || '';

module.exports = {
  HANDLERS: process.env.PREFIX || '.',
  BRANCH: process.env.BRANCH || 'main',
  VERSION: process.env.VERSION || '1.0.0',
  caption: process.env.CAPTION || '©Xstro',
  warncount: process.env.WARN_COUNT || '3',

  author: process.env.PACK_AUTHER || 'Xstro',
  packname: process.env.PACK_NAME || '♥️',
  botname: process.env.BOT_NAME || 'Xstro Bot',
  ownername: process.env.OWNER_NAME || 'Xstro',

  errorChat: process.env.ERROR_CHAT || '',
  KOYEB_API: process.env.KOYEB_API || 'false',

  REMOVE_BG_KEY: process.env.REMOVE_BG_KEY || 'gGmkEVWheRA4EpFtEgzbyq6k',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  antilink_values: process.env.ANTILINK_VALUES || 'all',
  HEROKU: process.env.HEROKU_APP_NAME && process.env.HEROKU_API_KEY,

  aitts_Voice_Id: process.env.AITTS_ID || '30',
  ELEVENLAB_API_KEY: process.env.ELEVENLAB_API_KEY || '',
  WORKTYPE: process.env.WORKTYPE || process.env.MODE || 'private',
  LANG: (process.env.THEME || 'CONFIG').toUpperCase(),
};

global.rank = 'updated';
global.isMongodb = false;
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update'${__filename}'`);
  delete require.cache[file];
  require(file);
});
