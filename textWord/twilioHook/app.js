const querystring = require('query-string');
const axios = require('axios');

let response;
const option = (word) => ({
  method: 'GET',
  url: `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`,
  headers: {
    'X-RapidAPI-Key': process.env.RapidApiKey,
    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
  },
});

exports.lambdaHandler = async (event, context) => {
  try {
    const parsedBody = querystring.parse(event.body);
    const messageBody = parsedBody.Body;

    console.log(parsedBody);

    const res = await axios.request(option(messageBody));
    const { definitions } = res.data;

    if (!definitions.length) throw new Error('no definitions');

    let message = `${definitions[0].partOfSpeech}: ${definitions[0].definition}`;

    if (definitions.length > 1)
      message += `\n${definitions[1].partOfSpeech}: ${definitions[1].definition}`;

    response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Message>${message}</Message>
        </Response>`,
    };
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Message>Sorry, something went wrong or I could not find that word. Please check the spelling of the word or try again later.</Message>
        </Response>`,
    };
  }

  return response;
};
