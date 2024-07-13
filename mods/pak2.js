const axios = require('axios');
const fetch = require('node-fetch');
async function aiResponse(message, type, prompt = '') {
  let response = '';
  try {
    switch (type) {
      case 'chat':
        response = await getChatResponse(message, prompt);
        break;
      case 'gpt':
        response = await getGPTResponse(prompt);
        break;
      case 'dalle':
        response = await getDalleResponse(prompt);
        break;
      case 'rmbg':
        response = await removeBackground(prompt);
        break;
    }
    return response;
  } catch (error) {
    console.error('Error in aiResponse:', error);
    return 'Error while getting AI response.';
  }
}

async function getChatResponse(message, prompt) {
  const response = await axios.get(`http://api.brainshop.ai/get?bid=175685&key=Pg8Wu8mrDQjfr0uv&uid=[${message.sender.split('@')[0]}]&msg=[${prompt}]`);
  return response.data.cnt;
}

async function getGPTResponse(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    return '*Invalid ChatGPT API Key, Please Put New Key*';
  }
  return data.choices[0].message.content;
}

async function getDalleResponse(prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'image-alpha-001',
      prompt: prompt,
      size: '512x512',
      response_format: 'url',
    }),
  });
  const data = await response.json();
  return data.data[0].url;
}

async function removeBackground(imageUrl) {
  try {
    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      { image_url: imageUrl, size: 'auto' },
      {
        headers: { 'X-Api-Key': Config.REMOVE_BG_KEY },
        responseType: 'arraybuffer',
      }
    );
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error in removeBackground:', error);
    return false;
  }
}

async function gpt4(query) {
  const apiUrl = `https://gpt4.giftedtech.workers.dev/?prompt=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.status === true && data.code === 200 && data.result) {
      return data.result;
    } else {
      throw new Error('Invalid response from GPT-4 API');
    }
  } catch (error) {
    console.error('Error fetching from GPT-4 API:', error);
    throw error;
  }
}

module.exports = { gpt4, aiResponse };
