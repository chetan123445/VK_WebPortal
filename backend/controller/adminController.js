import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

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
    const { email, password, isSuperAdmin, requesterEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    // Check if requester is a superadmin in the Admin table
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Only superadmin can add admins' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Admin already exists' });

    const admin = new Admin({ email, password, isSuperAdmin: !!isSuperAdmin });
    await admin.save();
    res.status(201).json({ message: 'Admin added', admin }); // In production, do not return password
  } catch (err) {
    res.status(500).json({ message: 'Failed to add admin', error: err.message });
  }
};

// Remove an admin (only superadmin can remove, but cannot remove another superadmin)
// No changes needed for password
export const removeAdmin = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if requester is a superadmin in the Admin table
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Only superadmin can remove admins' });
    }

    // Prevent removing another superadmin
    const toRemove = await Admin.findOne({ email });
    if (!toRemove) return res.status(404).json({ message: 'Admin not found' });
    if (toRemove.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot remove another superadmin' });
    }

    await Admin.deleteOne({ email });
    res.status(200).json({ message: 'Admin removed' });
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
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    // You can add JWT/session logic here if needed
    return res.json({ success: true, isAdmin: true, redirect: '/admin/dashboard' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
