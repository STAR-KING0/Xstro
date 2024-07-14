const { Innertube, UniversalCache, Utils } = require('youtubei.js');
const { existsSync, mkdirSync, createWriteStream } = require('fs');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const yt = {};

yt.getInfo = async (videoId, options = {}) => {
  try {
    const innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });

    let videoInfo = await innertubeInstance.getInfo(videoId, options);
    let qualityLabels = videoInfo.streaming_data.formats.map(format => format.quality_label);

    let preferredQuality = qualityLabels.includes('360p') ? '360p' : 'best';

    let info = {
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

    return info;
  } catch (error) {
    console.error('Error fetching video info:', error);
    return { status: false, error: error.message };
  }
};

yt.download = async (videoId, options = { type: 'video', quality: 'best', format: 'mp4' }) => {
  try {
    const innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });

    let downloadType = options.type || 'video';
    let downloadQuality = downloadType === 'audio' ? 'best' : options.quality || 'best';
    let downloadFormat = options.format || (downloadType === 'video' ? 'mp4' : 'm4a');

    const downloadStream = await innertubeInstance.download(videoId, {
      type: downloadType,
      quality: downloadQuality,
      format: downloadFormat,
    });

    const tempDir = './temp';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    let fileExtension = downloadType === 'video' ? 'mp4' : 'm4a';
    let filePath = `${tempDir}/YT_${videoId}_${Date.now()}.${fileExtension}`;
    let fileStream = createWriteStream(filePath);

    await pipeline(downloadStream, fileStream);

    return filePath;
  } catch (error) {
    console.error('Error downloading video:', error);
    return { status: false, error: error.message };
  }
};

module.exports = yt;
