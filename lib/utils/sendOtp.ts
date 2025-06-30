// lib/utils/sendOtp.ts
import nodemailer from "nodemailer";

export async function sendOTP(email: string, otp: string): Promise<void> {
  if (!email || !otp) throw new Error("Email and OTP are required");

  // Validate environment variables
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP configuration in environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for others
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"NetFrix Verification" <${SMTP_USER}>`,
    to: email,
    subject: "Your NetFrix OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>🔐 Your OTP Code</h2>
        <p>Hello,</p>
        <p>Your verification code for NetFrix is:</p>
        <h3 style="background: #000; color: #fff; padding: 10px; display: inline-block; letter-spacing: 2px;">${otp}</h3>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <small>This is an automated message from NetFrix. Please do not reply.</small>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email. Please try again.");
  }
}
