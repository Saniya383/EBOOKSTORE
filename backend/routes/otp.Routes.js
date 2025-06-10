import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const otpStore = {}; 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL, 
    pass: process.env.OTP_EMAIL_PASSWORD, 
  },
});
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; 

  try {
    await transporter.sendMail({
      from: `"Ebookstore" <${process.env.OTP_EMAIL}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (record && record.otp === otp && Date.now() < record.expires) {
    delete otpStore[email]; 
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
});

export default router;