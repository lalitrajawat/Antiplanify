const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendProjectCreatedEmail(toEmail, projectName) {
    if (!toEmail) return;

    const subject = `New project created: ${projectName}`;
    const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding:16px; background:#050012; color:#f9f9ff;">
      <h2 style="color:#c4a5ff;">Your new project is live 🚀</h2>
      <p>Your new project <strong>${projectName}</strong> has been created in Planify.</p>
      <p style="font-size:13px; color:#a29ac4;">Open your dashboard to start adding tasks and timelines.</p>
    </div>
  `;

    try {
      await transporter.sendMail({
        from: `"Planify" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`Email sent to ${toEmail} for project ${projectName}`);
    } catch (error) {
      console.error(`Failed to send email to ${toEmail}:`, error);
    }
}

module.exports = { sendProjectCreatedEmail };
