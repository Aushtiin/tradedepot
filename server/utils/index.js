const mailgun = require('mailgun-js');
require('dotenv').config()
const domain = process.env.MAILGUN_DOMAIN;
const apiKey = process.env.MAILGUN_SECRETKEY
const mg = mailgun({apiKey, domain});
const nodemailer = require("nodemailer");
const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: process.env.V_APIKEY,
  apiSecret: process.env.V_APISECRET
})

const sendMail = async (data) => {
  // mg.messages().send(data, function(error, body){
  //   if (error) {
  //     console.error(error)
  //   }
  //   console.log(body)
  // })
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  let info = await transporter.sendMail(data)
  console.log("Message sent: %s", info.messageId);
}

const sendSms = (to, text) => {
  vonage.message.sendSms("Tradedepot", to, text, (err, responseData) => {
    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
        } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
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
  sendMail,
  sendSms
}