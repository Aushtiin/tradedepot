const mailgun = require('mailgun-js');
require('dotenv').config()
const domain = process.env.MAILGUN_DOMAIN;
const apiKey = process.env.MAILGUN_SECRETKEY
const mg = mailgun({apiKey, domain});
const nodemailer = require("nodemailer");

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