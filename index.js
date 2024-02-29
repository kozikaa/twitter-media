const Axios = require('axios');
const getIp = require('get-ip-fanatic');

/**
 *
 * @param {string | MediaOptionsWithUrl} url A URL or an object with a URL property, and optionally a buffer and/or text property
 * @param {MediaOptions} [options] An object with a buffer and/or text property
 * @returns {Promise<Output | ErrorOutput>}
 */
module.exports = async function getTwitterMedia(url, options) {
  let input = {};
  if (typeof url === 'object') {
    if (url.url) {
      input = url;
    } else {
      return { found: false, error: 'No URL provided' };
    }
  } else if (typeof url === 'string') {
    input.url = url;
  } else {
    return { found: false, error: 'Invalid first argument' };
  }
  if (options) {
    Object.keys(options).forEach((key) => {
      input[key] = options[key];
    });
  }
  if (/twitter\.com|x\.com/.test(input.url)) {
    let apiURL = input.url.replace(/twitter\.com|x\.com/g, 'api.vxtwitter.com');
    try {
      let res = await Axios.get(apiURL);
      let result = res.data;
      if (!result.media_extended) {
        return { found: false, error: 'No media found' };
      }
      let media = [];
      for (let i = 0; i < result.media_extended.length; i++) {
        let mediaItem = result.media_extended[i];
        media[i] = {
          url: mediaItem.url,
        };
        if (input.buffer) {
          try {
            let res = await Axios.get(mediaItem.url, { responseType: 'arraybuffer' });
            media[i].buffer = Buffer.from(res.data, 'binary');
          } catch (err) {
            console.warn('Error getting buffer: ', err);
          }
        }
      }
      let output = {
        found: true,
        type: result.media_extended[0].type,
        media: media,
      };
      if (input.text) {
        output.text = result.text;
      }
      return output;
    } catch (err) {
      return { found: false, error: 'An issue occured. Make sure the twitter link is valid.' };
    }
  } else {
    return { found: false, error: `Invalid URL: ${input.url}` };
  }
};
