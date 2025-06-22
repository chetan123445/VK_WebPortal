import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  registeredAs: {
    type: String,
    enum: ['Student', 'Teacher', 'Parent'],
    required: true
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
    type: String
  }
});

const User = mongoose.model('User', userSchema);
export default User;
