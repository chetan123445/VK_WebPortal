import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js'; // <-- Add this import
dotenv.config();

// Helper to generate random password of length 5-10, different each time
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  const length = Math.floor(Math.random() * 6) + 5; // 5 to 10 inclusive
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

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

// Real email sending logic using nodemailer
async function sendAdminPasswordEmail(email, password) {
  if (!emailUser || !emailPass) {
    console.error('EMAIL_USER or EMAIL_PASS missing at sendAdminPasswordEmail');
    return;
  }
  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Your VK Publications Admin Account',
    text: `You have been added as an admin.\n\nLogin Email: ${email}\nPassword: ${password}\n\nPlease login and change your password after first login.`
  };

  await transporter.sendMail(mailOptions);
}

// Get all admins and superadmins
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, '-__v');
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admins', error: err.message });
  }
};

// Add a new admin (only superadmin can add)
export const addAdmin = async (req, res) => {
  try {
    const { email, isSuperAdmin, requesterEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if already an admin
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Admin already exists' });

    // Check if already a user
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ message: 'This email is already registered as a user and cannot be an admin.' });

    // Generate random password
    const randomPassword = generateRandomPassword();
    const admin = new Admin({ email, password: randomPassword, isSuperAdmin: !!isSuperAdmin });
    await admin.save();

    // Send email to the new admin with their password
    try {
      await sendAdminPasswordEmail(email, randomPassword);
    } catch (emailErr) {
      return res.status(201).json({ message: 'Admin added, but failed to send email.', error: emailErr.message });
    }

    res.status(201).json({ message: 'Admin added and credentials sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add admin', error: err.message });
  }
};

// Remove an admin (only superadmin can remove)
export const removeAdmin = async (req, res) => {
  try {
    const { email, isSuperAdmin, requesterEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Don't allow removing yourself
    if (email === requesterEmail) {
      return res.status(400).json({ message: "You can't remove yourself." });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    await Admin.deleteOne({ email });
    res.status(200).json({ message: 'Admin removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove admin', error: err.message });
  }
};

// Check if an email is an admin
// No changes needed for password
export const isAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ isAdmin: false, message: "Email required" });
  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (admin) {
      return res.json({ isAdmin: true, isSuperAdmin: admin.isSuperAdmin });
    }
    return res.json({ isAdmin: false });
  } catch (err) {
    return res.status(500).json({ isAdmin: false, message: "Server error" });
  }
};

// Admin login (secure, bcrypt)
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });
  try {
    // Always trim and lowercase for lookup
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      // Email not found in admin table
      return res.status(404).json({ message: 'User not registered.' });
    }
    // Email found, check password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      // Password does not match
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    // Success
    return res.json({ success: true, isAdmin: true, redirect: '/admin/dashboard' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if an email is a superadmin
export const checkSuperAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ isSuperAdmin: false, message: "Email required" });
  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (admin && admin.isSuperAdmin) {
      return res.json({ isSuperAdmin: true });
    }
    return res.json({ isSuperAdmin: false });
  } catch (err) {
    return res.status(500).json({ isSuperAdmin: false, message: "Server error" });
  }
};

