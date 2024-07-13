const bot = require('./lib/client');
const { VERSION } = require('./config');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds delay between retries

const start = async () => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      await initializeBot();
      await performAdditionalTasks(); // Introduce additional asynchronous tasks after bot initialization
      bot.logger.info('🎉 Initialization complete!');
      break; // Exit the loop if initialization and additional tasks are successful
    } catch (error) {
      Debug.error(`Initialization failed (Attempt ${retryCount + 1}/${MAX_RETRIES}): ${error}`);
      retryCount++;
      await wait(RETRY_DELAY_MS); // Wait before retrying
    }
  }

  if (retryCount === MAX_RETRIES) {
    Debug.warn(`Initialization failed after ${MAX_RETRIES} attempts. Exiting...`);
    process.exit(1); // Exit the process on multiple initialization failures
  }
};

const initializeBot = async () => {
  Debug.info(`Xstro On ${VERSION}`);
  await bot.init();
  await syncDatabase();
  await connectBot();
};

const syncDatabase = async () => {
  bot.logger.info('⏳ Database syncing...');
  await bot.DATABASE.sync();
  bot.logger.info('✅ Database synced successfully!');
};

const connectBot = async () => {
  bot.logger.info('⏳ Connecting to bot service...');
  await bot.connect();
  bot.logger.info('🚀 Bot connected successfully!');
};

const performAdditionalTasks = async () => {
  bot.logger.info('🔧 Performing additional tasks...');
  // Example: Fetching additional data, processing tasks, etc.
  await fetchData();
  await processTasks();
  bot.logger.info('🔧 Additional tasks completed!');
};

const fetchData = async () => {
  bot.logger.info('⏳ Fetching data...');
  // Simulating asynchronous data fetching
  await wait(2000); // 2 seconds delay
  bot.logger.info('✨ Data fetched successfully!');
};

const processTasks = async () => {
  bot.logger.info('⏳ Processing tasks...');
  // Simulating asynchronous task processing
  await wait(3000); // 3 seconds delay
  bot.logger.info('✨ Tasks processed successfully!');
};

const wait = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

start();
