const ffmpeg = require('fluent-ffmpeg')
const { randomBytes } = require('crypto')
const fs = require('fs')
const { getHttpStream, toBuffer } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
const { spawn } = require('child_process')
const path = require('path')
const { fromBuffer } = require('file-type')
const { tmpdir } = require('os')
const webp = require('node-webpmux')

async function toGif(inputBuffer) {
 try {
  const inputPath = `./${randomBytes(3).toString('hex')}.webp`
  const outputPath = `./${randomBytes(3).toString('hex')}.gif`

  fs.writeFileSync(inputPath, inputBuffer.toString('binary'), 'binary')

  const gifPath = await new Promise((resolve, reject) => {
   spawn('convert', [inputPath, outputPath])
    .on('error', reject)
    .on('exit', () => resolve(outputPath))
  })

  const gifBuffer = fs.readFileSync(gifPath)

  fs.unlinkSync(inputPath)
  fs.unlinkSync(gifPath)

  return gifBuffer
 } catch (error) {
  console.error(error)
 }
}

async function toMp4(inputFile) {
 try {
  const gifPath = `./${randomBytes(3).toString('hex')}.gif`
  const inputPath = fs.existsSync(inputFile) ? inputFile : save(inputFile, gifPath)
  const outputPath = `./${randomBytes(3).toString('hex')}.mp4`

  const mp4Path = await new Promise((resolve, reject) => {
   ffmpeg(inputPath)
    .outputOptions([
     '-pix_fmt yuv420p',
     '-c:v libx264',
     '-movflags +faststart',
     "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
    ])
    .toFormat('mp4')
    .noAudio()
    .save(outputPath)
    .on('end', () => resolve(outputPath))
    .on('error', reject)
  })

  const mp4Buffer = await fs.promises.readFile(mp4Path)

  fs.unlinkSync(inputPath)
  fs.unlinkSync(mp4Path)

  return mp4Buffer
 } catch (error) {
  console.error(error)
 }
}

const EightD = async inputBuffer => {
 const inputPath = `./temp/${randomBytes(3).toString('hex')}.mp3`
 const finalInput = Buffer.isBuffer(inputBuffer) ? save(inputBuffer, inputPath) : inputBuffer
 const outputPath = `./temp/${randomBytes(3).toString('hex')}.mp3`

 const outputFile = await new Promise((resolve, reject) => {
  ffmpeg(finalInput)
   .audioFilter(['apulsator=hz=0.125'])
   .audioFrequency(44100)
   .audioChannels(2)
   .audioBitrate('128k')
   .audioCodec('libmp3lame')
   .audioQuality(5)
   .toFormat('mp3')
   .save(outputPath)
   .on('end', () => resolve(outputPath))
   .on('error', reject)
 })

 return outputFile
}

function save(buffer, outputPath = './temp/saveFile.jpg') {
 try {
  fs.writeFileSync(outputPath, buffer.toString('binary'), 'binary')
  return outputPath
 } catch (error) {
  console.error(error)
 }
}

const resizeImage = (buffer, width, height) => {
 if (!Buffer.isBuffer(buffer)) {
  throw new Error('Input is not a Buffer')
 }

 return sharp(buffer).resize(width, height, { fit: 'contain' }).toBuffer()
}

const parseInput = async (input, extension = false, returnType = 'path') => {
 const buffer = await toBuffer(await getHttpStream(input))
 const filePath = `./temp/file_${randomBytes(3).toString('hex')}.${extension || (await fromBuffer(buffer)).ext}`
 const finalPath = Buffer.isBuffer(input) ? save(input, filePath) : fs.existsSync(input) ? input : input

 if (returnType === 'path') {
  return finalPath
 } else if (returnType === 'buffer') {
  const fileBuffer = await fs.promises.readFile(finalPath)
  await fs.promises.unlink(finalPath)
  return fileBuffer
 }
}

async function imageToWebp(imageBuffer) {
 const webpPath = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
 const jpgPath = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)

 fs.writeFileSync(jpgPath, imageBuffer)

 await new Promise((resolve, reject) => {
  ffmpeg(jpgPath)
   .outputOptions([
    '-vcodec',
    'libwebp',
    '-vf',
    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
   ])
   .toFormat('webp')
   .save(webpPath)
   .on('end', () => resolve(true))
   .on('error', reject)
 })

 const webpBuffer = fs.readFileSync(webpPath)
 fs.unlinkSync(webpPath)
 fs.unlinkSync(jpgPath)

 return webpBuffer
}

async function videoToWebp(videoBuffer) {
 const webpPath = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
 const mp4Path = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)

 fs.writeFileSync(mp4Path, videoBuffer)

 await new Promise((resolve, reject) => {
  ffmpeg(mp4Path)
   .outputOptions([
    '-vcodec',
    'libwebp',
    '-vf',
    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
    '-loop',
    '0',
    '-ss',
    '00:00:00',
    '-t',
    '00:00:05',
    '-preset',
    'default',
    '-an',
    '-vsync',
    '0',
   ])
   .toFormat('webp')
   .save(webpPath)
   .on('end', () => resolve(true))
   .on('error', reject)
 })

 const webpBuffer = fs.readFileSync(webpPath)
 fs.unlinkSync(webpPath)
 fs.unlinkSync(mp4Path)

 return webpBuffer
}

async function writeExifImg(imageBuffer, metadata) {
 const webpBuffer = await imageToWebp(imageBuffer)
 const webpPath = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)

 fs.writeFileSync(webpPath, webpBuffer)

 if (metadata.packname || metadata.author) {
  const img = new webp.Image()
  const exifData = {
   'sticker-pack-id': 'Suhail-Md',
   'sticker-pack-name': metadata.packname,
   'sticker-pack-publisher': metadata.author,
   emojis: metadata.categories ? metadata.categories : [''],
  }
  const exifHeader = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0])
  const exifBody = Buffer.from(JSON.stringify(exifData), 'utf-8')
  const exif = Buffer.concat([exifHeader, exifBody])
  exif.writeUIntLE(exifBody.length, 14, 4)

  await img.load(webpPath)
  fs.unlinkSync(webpPath)
  img.exif = exif
  await img.save(webpPath)

  return webpPath
 }
}

async function writeExifVid(videoBuffer, metadata) {
 const webpBuffer = await videoToWebp(videoBuffer)
 const webpPath = path.join(tmpdir(), `${randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)

 fs.writeFileSync(webpPath, webpBuffer)

 const img = new webp.Image()
 const exifData = {
  'sticker-pack-id': 'Suhail-Md',
  'sticker-pack-name': metadata.packname || 'Suhail-Md',
  'sticker-pack-publisher': metadata.author || 'Suhail-Md',
  emojis: metadata.categories ? metadata.categories : [''],
 }
 const exifHeader = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0])
 const exifBody = Buffer.from(JSON.stringify(exifData), 'utf-8')
 const exif = Buffer.concat([exifHeader, exifBody])
 exif.writeUIntLE(exifBody.length, 14, 4)

 await img.load(webpPath)
 fs.unlinkSync(webpPath)
 img.exif = exif
 await img.save(webpPath)

 return webpPath
}

module.exports = {
 EightD,
 imageToWebp,
 videoToWebp,
 parseInput,
 resizeImage,
 save,
 toGif,
 toMp4,
 writeExifImg,
 writeExifVid,
}
