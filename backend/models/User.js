import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  registeredAs: {
    type: String,
    enum: ['Student', 'Teacher', 'Parent'],
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  school: {
    type: String
  },
  class: {
    type: String,
    index: true
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    default: ""
  },
  childEmail: {
    type: String,
    // Only required for Parent, so not globally required
    default: ""
  },
  childClass: {
    type: String,
    // Only required for Parent, so not globally required
    default: ""
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});

// Create compound index for parent-child relationship queries
userSchema.index({ registeredAs: 1, childClass: 1 });

const User = mongoose.model('User', userSchema);

export default User;
