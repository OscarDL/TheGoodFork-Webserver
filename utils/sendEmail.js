const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    secure: false,
    port: 587,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      ciphers:'SSLv3'
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    html: options.content
  }

  transporter.sendMail(mailOptions, function(err, info) {
    console.log(err || info);
  });
}

module.exports = sendEmail;