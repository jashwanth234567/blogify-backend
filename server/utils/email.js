import nodemailer from 'nodemailer';

const getCleanPass = () => (process.env.SMTP_PASS || "").replace(/\s+/g, "");

const createTransporter = () => {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = getCleanPass();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      family: 4
    });
  }
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: { user, pass },
    family: 4,
    tls: { rejectUnauthorized: false }
  });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER ? `"Blogify Security" <${process.env.SMTP_USER.trim()}>` : (process.env.EMAIL_FROM || 'no-reply@blogify.com'),
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error };
  }
};
