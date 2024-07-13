const { bot } = require('../lib');
const { pingPong, getUptime, translateLanguage, excuteCode, runConsole } = require('../mods');

bot(
  {
    pattern: 'ping',
    desc: 'ping bot server',
    type: 'misc',
  },
  pingPong
);
bot(
  {
    pattern: 'runtime',
    alias: 'uptime',
    desc: 'get uptime/runtime of the bot',
    type: 'misc',
  },
  getUptime
);
bot(
  {
    pattern: 'translate',
    desc: 'Translates From Any Language To English',
    type: 'misc',
  },
  translateLanguage
);
bot(
  {
    pattern: 'exec',
    desc: 'Excute A Module & function',
    type: 'misc',
  },
  excuteCode
);
bot(
  {
    pattern: 'console',
    desc: 'Runs Node commands on Server Terminal',
    type: 'misc',
  },
  runConsole
);
