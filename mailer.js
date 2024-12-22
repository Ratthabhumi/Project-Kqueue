// mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Example: Using Gmail
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

const sendVerificationCode = (to, code) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: to,
        subject: 'Verification Code',
        text: `Your verification code is ${code}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendVerificationCode;
