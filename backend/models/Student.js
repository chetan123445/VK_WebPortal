import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registeredAs: { type: String, default: 'Student', enum: ['Student'] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  school: { type: String },
  class: { type: String },
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

const Student = mongoose.model('Student', studentSchema);

export default Student;
