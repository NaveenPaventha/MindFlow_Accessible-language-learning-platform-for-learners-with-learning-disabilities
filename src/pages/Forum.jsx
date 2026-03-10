import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { MessageSquare, ThumbsUp, Reply, Clock, User as UserIcon, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FORUM_STORAGE_KEY = 'mindflow_forum_posts';

const Forum = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [replyContent, setReplyContent] = useState({});
    const [activeReply, setActiveReply] = useState(null);
    const [error, setError] = useState('');

    const loadPosts = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(FORUM_STORAGE_KEY)) || [];
            setPosts(stored);
        } catch {
            setPosts([]);
        }
    };

    const savePosts = (updatedPosts) => {
        localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(updatedPosts));
        setPosts(updatedPosts);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            setError('Title and content are required.');
            return;
        }
        setError('');
        const newPost = {
            _id: `post_${Date.now()}`,
            title: newPostTitle.trim(),
            content: newPostContent.trim(),
            username: user?.name || user?.username || 'Anonymous',
            tags: ['General'],
            createdAt: new Date().toISOString(),
            replies: []
        };
        const existing = JSON.parse(localStorage.getItem(FORUM_STORAGE_KEY)) || [];
        savePosts([newPost, ...existing]);
        setNewPostTitle('');
        setNewPostContent('');
    };

    const handleReply = (postId) => {
        if (!replyContent[postId]?.trim()) return;
        const existing = JSON.parse(localStorage.getItem(FORUM_STORAGE_KEY)) || [];
        const updated = existing.map(p => {
            if (p._id === postId) {
                return {
                    ...p,
                    replies: [...p.replies, {
                        content: replyContent[postId].trim(),
                        username: user?.name || user?.username || 'Anonymous',
                        createdAt: new Date().toISOString()
                    }]
                };
            }
            return p;
        });
        savePosts(updated);
        setReplyContent({ ...replyContent, [postId]: '' });
        setActiveReply(null);
    };



    return (
        <DashboardLayout>
            <div className="container" style={{ margin: '40px auto', maxWidth: '1000px' }}>
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: 'var(--text-dark)' }}>
                        <MessageSquare size={36} color="var(--primary-cyan)"/> Collaborative Learning Forum
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Discuss concepts, ask questions, and help others learn!</p>
                </header>

                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

                {/* Create Post Section */}
                <div className="card" style={{ marginBottom: '40px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Start a Discussion</h3>
                    <form onSubmit={handleCreatePost}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                placeholder="What's on your mind? (Title)" 
                                value={newPostTitle} 
                                onChange={(e) => setNewPostTitle(e.target.value)} 
                                required 
                                style={{ fontWeight: 'bold' }}
                            />
                        </div>
                        <div className="input-group">
                            <textarea 
                                placeholder="Describe your question or discussion point here..." 
                                value={newPostContent} 
                                onChange={(e) => setNewPostContent(e.target.value)} 
                                required 
                                rows="4"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-3d" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18}/> Post Topic
                        </button>
                    </form>
                </div>

                {/* Post List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No discussions yet. Be the first to start one!
                        </div>
                    ) : posts.map(post => (
                        <article key={post._id} className="card hover-lift" style={{ borderLeft: '4px solid var(--primary-cyan)', padding: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-dark)' }}>{post.title}</h3>
                                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><UserIcon size={14}/> {post.username}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14}/> {new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {post.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--primary-cyan)', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12}/> {tag}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <p style={{ lineHeight: 1.6, color: 'var(--text-color)', marginBottom: '20px', padding: '15px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                                {post.content}
                            </p>

                            <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                <button 
                                    className="btn btn-ghost btn-sm" 
                                    onClick={() => setActiveReply(activeReply === post._id ? null : post._id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Reply size={16}/> Reply ({post.replies.length})
                                </button>
                            </div>

                            {/* Replies Section */}
                            {post.replies.length > 0 && (
                                <div style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '2px solid var(--border-color)' }}>
                                    {post.replies.map((reply, index) => (
                                        <div key={index} style={{ marginBottom: '15px', background: 'var(--background-color)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <strong>{reply.username}</strong>
                                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.95rem' }}>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input Box */}
                            {activeReply === post._id && (
                                <div className="animate-fade-in" style={{ marginTop: '20px', paddingLeft: '20px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Write a reply..." 
                                            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                            value={replyContent[post._id] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [post._id]: e.target.value })}
                                        />
                                        <button className="btn btn-secondary" onClick={() => handleReply(post._id)}>Reply</button>
                                    </div>
                                </div>
                            )}

                        </article>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Forum;
