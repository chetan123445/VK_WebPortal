import mongoose from 'mongoose';

const DiscussionNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['reply', 'comment'], required: true },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('DiscussionNotification', DiscussionNotificationSchema); 