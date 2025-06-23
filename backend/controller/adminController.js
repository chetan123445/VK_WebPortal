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
