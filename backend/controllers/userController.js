import User from '../models/User.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const otpStore = new Map(); // In-memory OTP store: { email: { otp, expiresAt } }

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Send email on successful login
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login Notification',
      text: 'You have successfully logged in to your account.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      // Ignore errors for email sending, just log
      if (error) {
        console.log('Email error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email, { otp, expiresAt });

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log('Nodemailer error:', error); // Add this line
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  otpStore.delete(email);
  // Optionally, you can create a session or JWT here
  res.status(200).json({ message: 'OTP verified' });
};