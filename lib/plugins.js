const commands = [];

function Index(commandOptions, handler) {
  const command = { ...commandOptions };
  command.function = handler;

  // Set default values if not provided
  command.pattern = command.pattern || command.cmdname || '';
  command.alias = command.alias || [];
  command.dontAddCommandList = command.dontAddCommandList || false;
  command.desc = command.desc || command.info || '';
  command.fromMe = command.fromMe || false;
  command.category = command.category || command.type || 'misc';
  command.info = command.desc;
  command.type = command.category;

  commands.push(command);
  return command;
}

module.exports = {
  Index,
  cmd: Index,
  smd: Index,
  commands: commands,
  bot: Index,
};
