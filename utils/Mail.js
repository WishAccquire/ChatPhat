import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mail = async (email, title, body) => {
  try{
  const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

  const info = await transporter.sendMail({
    from: `"CHATPHAT" <${process.env.MAIL_USER}>`,
    to: email,
    subject: title,
    html: body,
  });
console.log("Mail sent:", info.messageId);
  return info;
}catch (err) {
  console.error("Mail sending failed:", err);
  throw err;
}
};
