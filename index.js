



//TEst Scripts
/*
const { initBot, connectBot, syncDatabase } = require('./lib/test')
const { VERSION } = require('./config')
const { info, error, fatal } = require('./logger')

async function start() {
 info(`Starting Xstro Bot v${VERSION}`)

 try {
  await initBot()
  info('Initializing database...')
  await syncDatabase()
  info('Database synchronized successfully.')

  await connectBot()
  info('Bot connected successfully.')
 } catch (err) {
  error('Error during startup:', err)
  info('Attempting to restart...')
  setTimeout(start, 5000) // Restart after 5 seconds
 }
}

start().catch(err => {
 fatal('Unhandled error during startup:', err)
 process.exit(1)
})

*/

/*const bot = require('/lib/client')
const { VERSION } = require('/config')

async function start() {
 logger.info(`Starting xstro Bot v${VERSION}`)

 try {
  await bot.init()
  logger.info('Initializing database...')
  await bot.DATABASE.sync()
  logger.info('Database synchronized successfully.')

  await bot.connect()
  logger.info('Bot connected successfully.')
 } catch (error) {
  logger.error('Error during startup:', error)
  logger.info('Attempting to restart...')
  setTimeout(start, 5000) // Restart after 5 seconds
 }
}

start().catch(error => {
 logger.fatal('Unhandled error during startup:', error)
 process.exit(1)
})
*/
