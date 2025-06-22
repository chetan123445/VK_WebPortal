import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const otpStore = {}; // { email: { otp, expires } }
const loginOtpStore = {}; // Separate store for login OTPs

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

if (!emailUser || !emailPass) {
  console.error("EMAIL_USER or EMAIL_PASS is not set in .env");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Verify transporter at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Nodemailer transporter verification failed:', error);
  } else {
    console.log('Nodemailer transporter is ready');
  }
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    otpStore[cleanEmail] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min

    if (!emailUser || !emailPass) {
      console.error('EMAIL_USER or EMAIL_PASS missing at sendRegisterOtp');
      return res.status(500).json({ message: 'Email credentials not set on server.' });
    }

    // Log the email and OTP for debugging (remove in production)
    console.log(`Sending OTP ${otp} to ${cleanEmail}`);

    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Registration OTP',
      text: `Your OTP for registration is: ${otp}`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { registeredAs, email, password, school, class: userClass, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // OTP check
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      registeredAs,
      email: cleanEmail,
      password: hashedPassword,
      school,
      class: userClass
    });
    await user.save();

    // Remove OTP after successful registration
    delete otpStore[cleanEmail];

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding user', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({ message: "Login successful", user: { email: user.email, registeredAs: user.registeredAs } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    loginOtpStore[cleanEmail] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min

    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Login OTP',
      text: `Your OTP for login is: ${otp}`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error("Failed to send login OTP:", err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = loginOtpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Optionally, you can delete the OTP after successful verification
    delete loginOtpStore[cleanEmail];
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};
