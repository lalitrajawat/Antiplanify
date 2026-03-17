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

/* -------------------------------------------------
   SEND EMAIL WHEN A NEW PROJECT IS CREATED
--------------------------------------------------*/
async function sendProjectCreatedEmail(toEmail, projectName) {
    if (!toEmail) return;

    const subject = `New Project Created: ${projectName}`;
    const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding:16px; background:#050012; color:#f9f9ff;">
      <h2 style="color:#c4a5ff;">Your New Project is Live 🚀</h2>
      <p>Your new project <strong>${projectName}</strong> has been created in <strong>Planify</strong>.</p>
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
        console.error(`Failed to send project email to ${toEmail}:`, error);
    }
}


/* -------------------------------------------------
   SEND EMAIL WHEN USER SIGNS UP 🎉
--------------------------------------------------*/
async function sendWelcomeEmail(toEmail, userName) {
    if (!toEmail) return;

    const subject = `Welcome to Planify, ${userName}! 🎉`;

    const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding:20px; background:#050012; color:#f9f9ff;">
      <h2 style="color:#c4a5ff;">Welcome to Planify 🚀</h2>
      
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Thank you for signing up for <strong>Planify</strong>.</p>
      <p>You can now start creating projects, adding tasks, and managing your timelines easily.</p>

      <br/>
      <p style="font-size:13px; color:#a29ac4;">Log in now to begin your productivity journey.</p>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"Planify" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html,
        });

        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${toEmail}:`, error);
    }
}

/* -------------------------------------------------
   SEND PASSWORD RESET EMAIL 🔑
--------------------------------------------------*/
async function sendPasswordResetEmail(toEmail, resetUrl) {
    if (!toEmail) return;

    const subject = `Reset Your Planify Password`;

    const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding:20px; background:#050012; color:#f9f9ff;">
      <h2 style="color:#c4a5ff;">Password Reset Request</h2>
      
      <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
      <p>Please click on the link below to complete the process:</p>
      <a href="${resetUrl}" style="background:#c4a5ff; color:#050012; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin:20px 0;">Reset Password</a>
      
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <br/>
      <p style="font-size:13px; color:#a29ac4;">This link will expire in 10 minutes.</p>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"Planify" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: toEmail,
            subject,
            html,
        });

        console.log(`Password reset email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Failed to send password reset email to ${toEmail}:`, error);
    }
}

module.exports = {
    sendProjectCreatedEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
};
