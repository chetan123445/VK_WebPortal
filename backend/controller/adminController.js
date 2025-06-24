import Admin from '../models/Admin.js';

const SUPERADMIN_EMAIL = "chetandudi791@gmail.com";

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

    // Only allow superadmin to add admins
    if (requesterEmail !== SUPERADMIN_EMAIL) {
      return res.status(403).json({ message: 'Only superadmin can add admins' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Admin already exists' });

    const admin = new Admin({ email, isSuperAdmin: !!isSuperAdmin });
    await admin.save();
    res.status(201).json({ message: 'Admin added', admin });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add admin', error: err.message });
  }
};

// Remove an admin (only superadmin can remove)
export const removeAdmin = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Only allow superadmin to remove admins
    if (requesterEmail !== SUPERADMIN_EMAIL) {
      return res.status(403).json({ message: 'Only superadmin can remove admins' });
    }

    const removed = await Admin.findOneAndDelete({ email });
    if (!removed) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json({ message: 'Admin removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove admin', error: err.message });
  }
};

// Check if an email is an admin
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
