const os = require('os');
const fs = require('fs');
const Config = require('../config');
let { fancytext, tlang, runtime, formatp, prefix, Index } = require('../lib');
const long = String.fromCharCode(8206);
const readmore = long.repeat(4001);
const sᴜʜᴀɪʟ_ᴍᴅ = require('../lib/plugins');
const util = require('util');
const events = sᴜʜᴀɪʟ_ᴍᴅ;
const { commands } = require('../lib');
const { exec } = require('child_process');
const translatte = require('translatte');
const cron = require('node-cron');
const { fetchCategory, getallMenu, listCommandDesc, sendOwnerContact } = require('../mods');
var cronStart = false;
Index(
  {
    pattern: 'help',
    alias: 'category',
    desc: 'show categorys',
    type: 'user',
  },
  fetchCategory
);

Index(
  {
    pattern: 'menu',
    desc: 'show all available commands',
    type: 'user',
  },
  getallMenu
);
Index(
  {
    pattern: 'cmdhelp',
    desc: 'list all command functions',
    type: 'user',
  },
  listCommandDesc
);
Index(
  {
    pattern: 'owner',
    desc: 'To check ping',
    category: 'general',
  },
  sendOwnerContact
);
