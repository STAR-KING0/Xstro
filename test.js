const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs').promises
const path = require('path')

async function downloadGitHubFiles(repoUrl, savePath) {
 try {
  // Fetch the HTML content of the GitHub page
  const response = await axios.get(repoUrl)
  const html = response.data

  // Parse the HTML to extract file links
  const $ = cheerio.load(html)
  const fileLinks = $('a[role="rowheader"]')
   .map((_, el) => $(el).attr('href'))
   .get()
   .filter(href => href.endsWith('.js'))

  // Create the save directory if it doesn't exist
  await fs.mkdir(savePath, { recursive: true })

  // Download each file
  for (const fileLink of fileLinks) {
   const fileName = path.basename(fileLink)
   const fileUrl = `https://raw.githubusercontent.com${fileLink.replace('/blob', '')}`

   const fileContent = await axios.get(fileUrl)
   const filePath = path.join(savePath, fileName)

   await fs.writeFile(filePath, fileContent.data)
   console.log(`Downloaded: ${fileName}`)
  }

  console.log('All files downloaded successfully!')
 } catch (error) {
  console.error('Error downloading files:', error.message)
 }
}

// Usage
const repoUrl = 'https://github.com/AstroFx0011/Xstro/tree/master/lib'
const savePath = './lib'

downloadGitHubFiles(repoUrl, savePath)

module.exports = { downloadGitHubFiles }
