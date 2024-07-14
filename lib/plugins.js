// Array to store all the commands
const commands = [];

/**
 * Create a new command
 *
 * @param {Object} commandObj - The command object
 * @param {Function} handler - The function handler for the command
 * @returns {Object} The created command object, or null if cmdname or pattern is missing
 */
function Index(commandObj, handler) {
  const command = commandObj;
  command.function = handler;

  // Set the pattern if cmdname is provided
  if (!command.pattern && commandObj.cmdname) {
    command.pattern = commandObj.cmdname;
  }

  // Check if cmdname or pattern is missing, and don't add to commands array
  if (!command.cmdname && !command.pattern) {
    console.warn(`Command skipped: Missing cmdname or pattern`);
    return null;
  }

  // Initialize properties if not already set
  command.alias = command.alias || [];
  command.dontAddCommandList = command.dontAddCommandList || false;
  command.desc = command.desc || commandObj.info || '';
  command.fromMe = command.fromMe || false;
  command.isAdminCommand = command.isAdminCommand || false;
  command.category = command.category || commandObj.type || 'misc';

  // Set additional properties
  command.info = command.desc;
  command.type = command.category;
  command.use = command.use || '';
  command.filename = command.filename || 'Not Provided';

  // Add the command to the commands array
  commands.push(command);

  return command;
}

// Exports For Plugins
module.exports = {
  Index,
  smd: Index,
  commands,
  bot: Index,
};
