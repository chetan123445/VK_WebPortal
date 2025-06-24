import User from '../models/User.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js'; // <-- Add this

// In-memory OTP store: { email: { otp, expires } }
const otpStore = {};

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to parent email after validation
export const sendOtp = async (req, res) => {
  try {
    const { email, childEmail } = req.body;
    const parentEmail = email.trim().toLowerCase();
    const childEmailClean = childEmail.trim().toLowerCase();

    // Check if parent email is an admin
    const isAdmin = await Admin.findOne({ email: parentEmail });
    if (isAdmin) {
      return res.status(409).json({ message: 'You cannot use this email. It is an admin ID. Please use a different email.' });
    }

    // Parent email must not be registered as Parent or Student
    const parentExists = await User.findOne({ email: parentEmail });
    if (parentExists && (parentExists.registeredAs === 'Parent' || parentExists.registeredAs === 'Student')) {
      return res.status(409).json({ message: 'Parent email already registered as Parent or Student.' });
    }

    // Child email must exist as Student
    const childUser = await User.findOne({ email: childEmailClean, registeredAs: 'Student' });
    if (!childUser) {
      return res.status(404).json({ message: 'No student found with this child email.' });
    }

    // Send OTP to parent email
    const otp = generateOtp();
    otpStore[parentEmail] = { otp, expires: Date.now() + 10 * 60 * 1000, childEmail: childEmailClean };
    await transporter.sendMail({
      from: emailUser,
      to: parentEmail,
      subject: 'VK Publications Parent Registration OTP',
      text: `Your OTP for parent registration is: ${otp}`
    });
    res.json({ message: 'OTP sent to parent email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// Register parent after OTP and password
export const register = async (req, res) => {
  try {
    const { name, email, childEmail, otp, password } = req.body;
    const parentEmail = email.trim().toLowerCase();
    const childEmailClean = childEmail.trim().toLowerCase();

    // Check if parent email is an admin
    const isAdmin = await Admin.findOne({ email: parentEmail });
    if (isAdmin) {
      return res.status(409).json({ message: 'You cannot use this email. It is an admin ID. Please use a different email.' });
    }

    // OTP check
    const record = otpStore[parentEmail];
    if (!record || record.otp !== otp || record.expires < Date.now() || record.childEmail !== childEmailClean) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Parent email must not be registered as Parent or Student
    const parentExists = await User.findOne({ email: parentEmail });
    if (parentExists && (parentExists.registeredAs === 'Parent' || parentExists.registeredAs === 'Student')) {
      return res.status(409).json({ message: 'Parent email already registered as Parent or Student.' });
    }

    // Child email must exist as Student
    const childUser = await User.findOne({ email: childEmailClean, registeredAs: 'Student' });
    if (!childUser) {
      return res.status(404).json({ message: 'No student found with this child email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      registeredAs: 'Parent',
      email: parentEmail,
      password: hashedPassword,
      childEmail: childEmailClean,
      phone: ""
    });
    await user.save();
    delete otpStore[parentEmail];
    res.status(201).json({ message: 'Parent registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Parent registration failed', error: err.message });
  }
};

// Find parent by email
export const find = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, registeredAs: 'Parent' });
    if (!user) return res.status(404).json({ message: 'Parent not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding parent', error: err.message });
  }
};

export default { sendOtp, register, find };
