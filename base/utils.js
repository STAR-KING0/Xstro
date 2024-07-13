const fs = require('fs-extra');
const { unlink } = require('fs').promises;
const axios = require('axios');
const moment = require('moment-timezone');
const { sizeFormatter } = require('human-readable');
const util = require('util');
const child_process = require('child_process');

// Unix timestamp in seconds
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;

// Sleep function using promises
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
exports.sleep = sleep;
exports.delay = sleep;

// Check if a string is a URL
const isUrl = str => {
  return str.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};
exports.isUrl = isUrl;

// Generate a message tag with optional suffix
exports.generateMessageTag = suffix => {
  let timestamp = unixTimestampSeconds().toString();
  if (suffix) {
    timestamp += '.--' + suffix;
  }
  return timestamp;
};

// Calculate processing time
exports.processTime = (startTime, endTime) => {
  return moment.duration(endTime - moment(startTime * 1000)).asSeconds();
};

// Fetch content and return as buffer
const getBuffer = async (source, options = {}, method = 'get') => {
  try {
    if (Buffer.isBuffer(source)) {
      return source;
    }
    if (/http/gi.test(source)) {
      const response = await axios({
        method,
        url: source,
        headers: {
          DNT: 1,
          'Upgrade-Insecure-Request': 1,
        },
        ...options,
        responseType: 'arraybuffer',
      });
      return response.data;
    } else if (fs.existsSync(source)) {
      return fs.readFileSync(source);
    } else {
      return source;
    }
  } catch (error) {
    console.log('Error while getting data in buffer:', error);
    return false;
  }
};
exports.getBuffer = getBuffer;
exports.smdBuffer = getBuffer;

// Fetch JSON data from URL
const fetchJson = async (url, params = {}, method = 'GET') => {
  try {
    const response = await axios({
      method,
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
      },
      ...params,
    });
    return response.data;
  } catch (error) {
    console.log('Error while fetching data in JSON:', error);
    return false;
  }
};
exports.fetchJson = fetchJson;
exports.smdJson = fetchJson;

// Format seconds into readable runtime string
exports.runtime = function (seconds, daySuffix = ' d', hourSuffix = ' h', minuteSuffix = ' m', secondSuffix = ' s') {
  seconds = Number(seconds);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${days > 0 ? days + daySuffix + ', ' : ''}${hours > 0 ? hours + hourSuffix + ', ' : ''}${minutes > 0 ? minutes + minuteSuffix + ', ' : ''}${remainingSeconds}${secondSuffix}`;
};

// Format seconds into clock time string
exports.clockString = function (seconds) {
  const hours = isNaN(seconds) ? '--' : Math.floor((seconds % 86400) / 3600);
  const minutes = isNaN(seconds) ? '--' : Math.floor((seconds % 3600) / 60);
  const remainingSeconds = isNaN(seconds) ? '--' : Math.floor(seconds % 60);
  return [hours, minutes, remainingSeconds].map(num => num.toString().padStart(2, '0')).join(':');
};

// Get formatted time based on timezone or current timezone
const getTime = (format, timezone) => {
  const zone = global.timezone || 'Asia/Karachi';
  return timezone ? moment.tz(timezone, zone).format(format) : moment.tz(zone).format(format);
};
exports.getTime = getTime;

// Format date to locale
exports.formatDate = (date, locale = 'id') => {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
};

// Format size using JEDEC standard
exports.formatp = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (size, unit) => `${size} ${unit}B`,
});

// Format JSON object for display
exports.jsonformat = obj => {
  return JSON.stringify(obj, null, 2);
};

// Format strings using util.format
const format = (...args) => {
  return util.format(...args);
};
exports.format = format;

// Execute logic based on input, output, and conditions
exports.logic = (input, conditions, output) => {
  if (conditions.length !== output.length) {
    throw new Error('Input and Output must have the same length');
  }
  for (let i in conditions) {
    if (util.isDeepStrictEqual(input, conditions[i])) {
      return output[i];
    }
  }
  return null;
};

// Generate profile picture from image file
exports.generateProfilePicture = async path => {
  const jimp = require('jimp');
  const image = await jimp.read(path);
  const width = image.getWidth();
  const height = image.getHeight();
  const cropped = image.crop(0, 0, width, height);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG),
  };
};

// Convert bytes to readable size
exports.bytesToSize = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get size of media content
exports.getSizeMedia = content => {
  try {
    if (!content) {
      return 0;
    }
    if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('Http'))) {
      try {
        const response = axios.head(content);
        const size = parseInt(response.headers['content-length']);
        const formattedSize = exports.bytesToSize(size, 3);
        if (!isNaN(size)) {
          return formattedSize;
        }
      } catch (error) {
        console.log(error);
        return 0;
      }
    } else if (Buffer.isBuffer(content)) {
      const size = Buffer.byteLength(content);
      const formattedSize = exports.bytesToSize(size, 3);
      if (!isNaN(size)) {
        return formattedSize;
      } else {
        return size;
      }
    } else {
      throw "Error: Couldn't fetch size of file";
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// Parse mentions from a string
exports.parseMention = (str = '') => {
  return [...str.matchAll(/@([0-9]{5,16}|0)/g)].map(match => match[1] + '@s.whatsapp.net');
};

// Convert GIF buffer to video buffer
exports.GIFBufferToVideoBuffer = async buffer => {
  const filename = '' + Math.random().toString(36);
  await fs.writeFileSync('./' + filename + '.gif', buffer);
  child_process.exec('ffmpeg -i ./' + filename + '.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./' + filename + '.mp4');
  await sleep(6000);
  const videoBuffer = await fs.readFileSync('./' + filename + '.mp4');
  Promise.all([unlink('./' + filename + '.mp4'), unlink('./' + filename + '.gif')]);
  return videoBuffer;
};
