const axios = require('axios');
const fs = require('fs').promises;
const util = require('util');

// Fetch JSON data from a URL
async function fetchJSON(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching JSON from ${url}: ${error.message}`);
  }
}

// Post JSON data to a URL
async function postJSON(url, data) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error posting JSON to ${url}: ${error.message}`);
  }
}

// Parse JSON string to JavaScript object
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Error parsing JSON string: ${error.message}`);
  }
}

// Format JavaScript object to JSON string
function formatJSON(jsonObject) {
  try {
    return JSON.stringify(jsonObject, null, 2); // 2 spaces for indentation
  } catch (error) {
    throw new Error(`Error formatting JSON object: ${error.message}`);
  }
}
module.exports = {
  fetchJSON,
  postJSON,
  parseJSON,
  formatJSON,
};
