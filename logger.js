const winston = require('winston')

const logger = winston.createLogger({
 level: 'info',
 format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
   return `${timestamp} ${level}: ${message}`
  })
 ),
 transports: [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'error.log', level: 'error' }),
  new winston.transports.File({ filename: 'combined.log' }),
 ],
})

function info(message) {
 logger.info(message)
}

function error(message, err) {
 logger.error(`${message} ${err.stack || err}`)
}

function fatal(message, err) {
 logger.error(`FATAL: ${message} ${err.stack || err}`)
}

module.exports = {
 info,
 error,
 fatal,
}
