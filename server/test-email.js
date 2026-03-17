require('dotenv').config();
const { sendProjectCreatedEmail } = require('./utils/emailService');

console.log('Testing email service...');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);

async function test() {
    try {
        await sendProjectCreatedEmail(process.env.SMTP_USER, 'Test Project');
        console.log('Test email sent successfully.');
    } catch (error) {
        console.error('Test email failed:', error);
    }
}

test();
