import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createDiscussionThread, 
  fetchDiscussionThreads, 
  fetchDiscussionThread,
  addDiscussionPost,
  voteThread,
  votePost
} from '../../service/api';

export default function DiscussionPanel() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetchDiscussionThreads();
      setThreads(res.data);
    } catch (err) {
      setError('Failed to load threads');
    }
    setLoading(false);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !body) {
      setError('Title and body are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await createDiscussionThread({ title, body }, token);
      setTitle('');
      setBody('');
      fetchThreads();
    } catch (err) {
      setError('Failed to create thread');
    }
  };

  const handleViewThread = async (threadId) => {
    try {
      const res = await fetchDiscussionThread(threadId);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to load thread');
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await addDiscussionPost(selectedThread._id, { body: replyBody }, token);
      setReplyBody('');
      // Refresh the thread
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  const handleVoteThread = async (threadId, value) => {
    try {
      const token = localStorage.getItem('token');
      await voteThread(threadId, value, token);
      fetchThreads();
      if (selectedThread && selectedThread._id === threadId) {
        const res = await fetchDiscussionThread(threadId);
        setSelectedThread(res.data);
      }
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleVotePost = async (postId, value) => {
    try {
      const token = localStorage.getItem('token');
      await votePost(selectedThread._id, postId, value, token);
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const getVoteCount = (votes) => {
    return votes.reduce((sum, vote) => sum + vote.value, 0);
  };

  const getUserVote = (votes, userId) => {
    const vote = votes.find(v => v.user === userId);
    return vote ? vote.value : 0;
  };

  if (selectedThread) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <button 
          onClick={() => setSelectedThread(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0079d3', 
            cursor: 'pointer', 
            fontSize: 16, 
            marginBottom: 20 
          }}
        >
          ← Back to Threads
        </button>

        {/* Thread Details */}
        <div style={{ marginBottom: 24, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{selectedThread.title}</h1>
          <p style={{ color: '#666', marginBottom: 16, lineHeight: 1.6 }}>{selectedThread.body}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#888' }}>
              By: {selectedThread.createdBy?.name || 'Unknown'} ({selectedThread.createdBy?.role || 'User'})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                onClick={() => handleVoteThread(selectedThread._id, 1)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: 20,
                  color: getUserVote(selectedThread.votes, 'current-user-id') === 1 ? '#ff4500' : '#888'
                }}
              >
                ▲
              </button>
              <span style={{ fontWeight: 600 }}>{getVoteCount(selectedThread.votes)}</span>
              <button 
                onClick={() => handleVoteThread(selectedThread._id, -1)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: 20,
                  color: getUserVote(selectedThread.votes, 'current-user-id') === -1 ? '#7193ff' : '#888'
                }}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Add Reply */}
        <form onSubmit={handleAddReply} style={{ marginBottom: 24 }}>
          <textarea
            placeholder="Write your reply..."
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, marginBottom: 12, fontSize: 16, borderRadius: 6, border: '1px solid #ddd' }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '8px 16px', 
              fontSize: 14, 
              borderRadius: 6, 
              background: '#0079d3', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reply
          </button>
        </form>

        {/* Posts */}
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Replies ({selectedThread.posts.length})</h3>
        {selectedThread.posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No replies yet. Be the first to reply!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedThread.posts.map(post => (
              <div key={post._id} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                <p style={{ color: '#333', marginBottom: 12, lineHeight: 1.5 }}>{post.body}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#888' }}>
                    By: {post.createdBy?.name || 'Unknown'} ({post.createdBy?.role || 'User'})
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => handleVotePost(post._id, 1)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: 16,
                        color: getUserVote(post.votes, 'current-user-id') === 1 ? '#ff4500' : '#888'
                      }}
                    >
                      ▲
                    </button>
                    <span style={{ fontWeight: 600 }}>{getVoteCount(post.votes)}</span>
                    <button 
                      onClick={() => handleVotePost(post._id, -1)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: 16,
                        color: getUserVote(post.votes, 'current-user-id') === -1 ? '#7193ff' : '#888'
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Discussion Panel</h2>
      
      {/* Create Thread Form */}
      <form onSubmit={handleCreateThread} style={{ marginBottom: 32, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create New Thread</h3>
        <input
          type="text"
          placeholder="Thread title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, fontSize: 16, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <textarea
          placeholder="Describe your question or topic..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 12, marginBottom: 12, fontSize: 16, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 24px', 
            fontSize: 16, 
            borderRadius: 6, 
            background: '#0079d3', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Create Thread
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>

      {/* Threads List */}
      <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>All Threads</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading threads...</div>
      ) : threads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No threads yet. Be the first to start a discussion!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {threads.map(thread => (
            <div key={thread._id} style={{ padding: 20, border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer' }} onClick={() => handleViewThread(thread._id)}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#333' }}>
                {thread.title}
              </div>
              <div style={{ color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
                {thread.body.length > 200 ? thread.body.substring(0, 200) + '...' : thread.body}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#888' }}>
                  By: {thread.createdBy?.name || 'Unknown'} ({thread.createdBy?.role || 'User'}) • {thread.posts?.length || 0} replies
                </span>
                <span style={{ fontSize: 14, color: '#888' }}>
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 