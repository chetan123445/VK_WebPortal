import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isSuperAdmin: { type: Boolean, default: false }
});

const Admin = mongoose.model('Admin', adminSchema);

// Ensure superadmin always exists in the database
(async () => {
  const superAdminEmail = "chetandudi791@gmail.com";
  const exists = await Admin.findOne({ email: superAdminEmail });
  if (!exists) {
    await Admin.create({ email: superAdminEmail, isSuperAdmin: true });
    console.log("Default superadmin created in Admin table.");
  }
})();

export default Admin;
