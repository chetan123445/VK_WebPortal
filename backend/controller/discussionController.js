import DiscussionThread from '../models/discussion/DiscussionThread.js';
import User from '../models/User.js';

// Create a thread
export const createThread = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required.' });
    }
    const thread = new DiscussionThread({
      title,
      body,
      createdBy: req.user._id,
      posts: [],
      votes: []
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all threads
export const getThreads = async (req, res) => {
  try {
    const threads = await DiscussionThread.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role')
      .populate('posts.createdBy', 'name role');
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single thread with posts
export const getThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await DiscussionThread.findById(threadId)
      .populate('createdBy', 'name role')
      .populate('posts.createdBy', 'name role');
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add post to thread
export const addPost = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body, parentPost } = req.body;
    
    if (!body) {
      return res.status(400).json({ message: 'body is required.' });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const newPost = {
      body,
      createdBy: req.user._id,
      parentPost: parentPost || null,
      votes: [],
      createdAt: new Date()
    };

    thread.posts.push(newPost);
    await thread.save();
    
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on thread
export const voteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { value } = req.body;
    
    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Remove existing vote by this user
    thread.votes = thread.votes.filter(vote => vote.user.toString() !== req.user._id.toString());
    
    // Add new vote
    thread.votes.push({
      user: req.user._id,
      value
    });

    await thread.save();
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on post
export const votePost = async (req, res) => {
  try {
    const { threadId, postId } = req.params;
    const { value } = req.body;
    
    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const post = thread.posts.id(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove existing vote by this user
    post.votes = post.votes.filter(vote => vote.user.toString() !== req.user._id.toString());
    
    // Add new vote
    post.votes.push({
      user: req.user._id,
      value
    });

    await thread.save();
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 