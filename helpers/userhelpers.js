const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

module.exports = {
    generateOTP: () => {
        return randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
    },
    transporter : nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your_email@gmail.com', // Your Gmail email address
          pass: 'your_password' // Your Gmail password
        }
      });

}