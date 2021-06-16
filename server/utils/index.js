const mailgun = require('mailgun-js');
require('dotenv').config()
const domain = process.env.MAILGUN_DOMAIN;
const apiKey = process.env.MAILGUN_SECRETKEY
const mg = mailgun({apiKey, domain});

const sendMail = (data) => {
  mg.messages().send(data, function(error, body){
    if (error) {
      console.error(error)
    }
    console.log(body)
  })
}

const sendJSONResponse = (res, message, status, statusCode, data) => {
  res.status(statusCode);
  res.json({
    message,
    status,
    data,
  });
};



module.exports = {
  sendJSONResponse,
  sendMail
}