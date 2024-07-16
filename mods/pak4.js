const { Innertube, UniversalCache, Utils } = require('youtubei.js');
const { existsSync, mkdirSync, createWriteStream } = require('fs');
const path = require('path');

class YouTubeModule {
  constructor() {
    this.ytInstance = null;
  }

  async initialize() {
    if (!this.ytInstance) {
      this.ytInstance = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
      });
    }
  }

  async getInfo(videoId, options = {}) {
    try {
      await this.initialize();
      const videoInfo = await this.ytInstance.getInfo(videoId, options);
      const qualityLabels = videoInfo.streaming_data.formats.map(format => format.quality_label);
      const preferredQuality = qualityLabels.includes('360p') ? '360p' : 'best';

      return {
        status: true,
        title: videoInfo.basic_info.title,
        id: videoInfo.basic_info.id,
        quality: qualityLabels,
        pref_Quality: preferredQuality,
        duration: videoInfo.basic_info.duration,
        description: videoInfo.basic_info.short_description,
        keywords: videoInfo.basic_info.keywords,
        thumbnail: videoInfo.basic_info.thumbnail[0].url,
        author: videoInfo.basic_info.author,
        views: videoInfo.basic_info.view_count,
        likes: videoInfo.basic_info.like_count,
        category: videoInfo.basic_info.category,
        channel: videoInfo.basic_info.channel,
        basic_info: videoInfo,
      };
    } catch (error) {
      console.error('Error in getInfo:', error.message);
      return { status: false, error: error.message };
    }
  }

  async download(videoId, options = { type: 'video', quality: 'best', format: 'mp4' }) {
    try {
      await this.initialize();
      const { type = 'video', quality = 'best', format = 'mp4' } = options;
      const downloadStream = await this.ytInstance.download(videoId, {
        type,
        quality: type === 'audio' ? 'best' : quality,
        format,
      });

      const tempDir = path.join(__dirname, 'temp');
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      const fileExtension = type === 'video' ? 'mp4' : 'm4a';
      const filePath = path.join(tempDir, `ytvideo_${videoId}.${fileExtension}`);
      const fileStream = createWriteStream(filePath);

      for await (const chunk of Utils.streamToIterable(downloadStream)) {
        fileStream.write(chunk);
      }

      return filePath;
    } catch (error) {
      console.error('Error in download:', error.message);
      return false;
    }
  }
}

module.exports = new YouTubeModule();
