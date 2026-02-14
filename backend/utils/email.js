// backend/utils/email.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    // create reusable transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // change to "Outlook", "Yahoo", or use custom SMTP if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // mail options
    const mailOptions = {
      from: `"Book Bank" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;
