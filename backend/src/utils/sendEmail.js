

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// sendMail supports either sendMail(to, subject, html)
// or sendMail({ to, subject, html }) for backward compatibility.
const sendMail = async (a, b, c) => {
    let to, subject, html;

    if (typeof a === 'object' && a !== null && !Array.isArray(a)) {
        // called with an object
        ({ to, subject, html } = a);
    } else {
        to = a;
        subject = b;
        html = c;
    }

    try {
        if (!to) throw new Error('No recipients defined');

        const info = await transporter.sendMail({
            from: `KlatChat <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent Successfully', info.messageId || '');
        return info;
    } catch (error) {
        console.log('Email was not sent', error.message || error);
        throw error;
    }
};

module.exports = sendMail;