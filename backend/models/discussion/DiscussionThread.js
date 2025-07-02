import mongoose from 'mongoose';

const DiscussionThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{
    body: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentPost: { type: mongoose.Schema.Types.ObjectId, default: null }, // for nested replies
    votes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      value: { type: Number, enum: [1, -1], required: true }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, enum: [1, -1], required: true }
  }]
}, { timestamps: true });

export default mongoose.model('DiscussionThread', DiscussionThreadSchema); 