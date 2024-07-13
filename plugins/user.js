const { Index } = require('../lib');
const { fetchCategory, getallMenu, listCommandDesc, sendOwnerContact } = require('../mods');
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
