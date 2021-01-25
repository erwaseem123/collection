const nodemailer = require('nodemailer');
var fs = require("fs");
var ejs = require("ejs");
const send_grid = require('@sendgrid/mail');
send_grid.setApiKey(process.env.SENDGRID_API_KEY);
const email_client = process.env.EMAIL_CLIENT;

var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secureConnection: process.env.EMAIL_SSL,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = { send_email };

async function send_email(template_name, data) {
  data.url = process.env.WEB_URL;
  const template = await ejs.renderFile("node/v1/resources/emails/" + template_name + ".ejs", data);
  const email_data = {
    from: process.env.EMAIL_USERNAME,
    to: data.to,
    subject: data.subject,
    html: template
  };
  var result = await transporter.sendMail(email_data);
}