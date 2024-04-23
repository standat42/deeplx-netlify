import axios from 'axios';
import { random } from 'lodash';

const DEEPL_BASE_URL = 'https://www2.deepl.com/jsonrpc';
const headers = {
  'Content-Type': 'application/json',
  Accept: '*/*',
  'x-app-os-name': 'iOS',
  'x-app-os-version': '16.3.0',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'x-app-device': 'iPhone13,2',
  'User-Agent': 'DeepL-iOS/2.9.1 iOS 16.3.0 (iPhone13,2)',
  'x-app-build': '510265',
  'x-app-version': '2.9.1',
  Connection: 'keep-alive',
};

function getRandomNumber() {
  return random(8300000, 8399998) * 1000;
}

function getTimestamp(iCount) {
  const ts = Date.now();
  if (iCount === 0) {
    return ts;
  }
  iCount++;
  return ts - (ts % iCount) + iCount;
}

exports.handler = async function (event, context) {
  const id = getRandomNumber();

  numberAlternative = Math.max(Math.min(3, 0), 0);

  const postData = {
    jsonrpc: '2.0',
    method: 'LMT_handle_texts',
    id: id,
    params: {
      texts: [{ text: event.queryStringParameters.text, requestAlternatives: 0 }],
      splitting: 'newlines',
      lang: {
        source_lang_user_selected: event.queryStringParameters.sourceLang,
        target_lang: event.queryStringParameters.targetLang,
      },
      timestamp: getTimestamp(0),
    },
  };

  let postDataStr = JSON.stringify(postData);

  if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
    postDataStr = postDataStr.replace('"method":"', '"method" : "');
  } else {
    postDataStr = postDataStr.replace('"method":"', '"method": "');
  }

  const response = await axios.post(DEEPL_BASE_URL, postDataStr, {
    headers: headers,
  });

  if (response.status === 429) {
    throw new Error(
      `Too many requests, your IP has been blocked by DeepL temporarily, please don't request it frequently in a short time.`
    );
  }

  if (response.status !== 200) {
    console.error('Error', response.status);
    return;
  }

  const result = response.data.result.texts[0]

  return {
      statusCode: 200,
      headers: {
          'content-type': 'application/json'
      },
      body: result
  };
};
