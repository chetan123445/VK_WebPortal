import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isSuperAdmin: { type: Boolean, default: false }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
