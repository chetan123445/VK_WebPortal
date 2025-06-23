import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';

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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'backend', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
export const upload = multer({ storage });

// GET /api/profile?email=...
export const getProfile = async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Convert photo buffer to base64 string for frontend
    let userObj = user.toObject();
    if (userObj.photo && userObj.photo.data) {
      userObj.photo = `data:${userObj.photo.contentType};base64,${userObj.photo.data.toString('base64')}`;
    } else {
      userObj.photo = null;
    }
    res.json({ user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// PUT /api/profile (fields: email, phone, school, class, photo)
export const updateProfile = async (req, res) => {
  try {
    const { email, name, phone, school, class: userClass, deletePhoto } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();
    const update = { name, phone, school, class: userClass };
    if (deletePhoto === true || deletePhoto === 'true') {
      update.photo = { data: undefined, contentType: undefined };
    } else if (req.file) {
      update.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Convert photo buffer to base64 string for frontend
    let userObj = user.toObject();
    if (userObj.photo && userObj.photo.data) {
      userObj.photo = `data:${userObj.photo.contentType};base64,${userObj.photo.data.toString('base64')}`;
    } else {
      userObj.photo = null;
    }
    res.json({ message: 'Profile updated', user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
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
    const { name, registeredAs, email, password, school, class: userClass, phone, otp } = req.body;
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
      name,
      registeredAs,
      email: cleanEmail,
      password: hashedPassword,
      school,
      class: userClass,
      phone: phone || "" // <-- Allow phone to be optional
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
