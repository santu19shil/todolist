const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendMail(options) {
    return transporter.sendMail({
        from: process.env.MAIL_FROM,
        ...options
    });
}

module.exports = { sendMail };