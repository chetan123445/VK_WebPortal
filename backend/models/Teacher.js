import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registeredAs: { type: String, default: 'Teacher', enum: ['Teacher'] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    default: ""
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
