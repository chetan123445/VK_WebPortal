import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: false }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

// Ensure superadmin always exists in the database
(async () => {
  const superAdminEmail = "chetandudi791@gmail.com";
  const defaultPassword = "vkgp_123";
  const exists = await Admin.findOne({ email: superAdminEmail });
  if (!exists) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await Admin.create({ email: superAdminEmail, password: hashedPassword, isSuperAdmin: true });
    console.log("Default superadmin created in Admin table.");
  }
})();

export default Admin;
