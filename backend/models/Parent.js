import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registeredAs: { type: String, default: 'Parent', enum: ['Parent'] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  childEmail: { type: String, required: true },
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

const Parent = mongoose.model('Parent', parentSchema);

export default Parent;
