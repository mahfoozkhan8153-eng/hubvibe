import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'https://hubvibe-backend.onrender.com';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'jobs'
  const [activeCommunity, setActiveCommunity] = useState('SaaS Developers');
  
  // Real-time Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Community Posts state (CRUD support)
  const [posts, setPosts] = useState([
    { id: 1, author: 'Savant Jha', content: 'Building local event discovery with Node.js and Leaflet maps!', community: 'SaaS Developers', comments: [] },
    { id: 2, author: 'Ayushi Sharma', content: 'Looking for a study partner for advanced MERN stack architecture.', community: 'Digital Nomads', comments: [] }
  ]);
  const [newPostContent, setNewPostContent] = useState('');

  // Job Board state (Pro Member only feature)
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Full Stack MERN Developer Needed', company: 'Persevex Remote', desc: 'Looking for an intern to build real-time socket modules.' }
  ]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to parse user data", e);
    }

    // Socket.io connection setup
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('receiveMessage', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => newSocket.close();
  }, [navigate]);

  // Handle Real-time Chat message sending
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        sender: user?.username || 'Member',
        text: newMessage,
        community: activeCommunity,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };

  // Handle Post Creation (Discussion Boards)
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const postItem = {
      id: Date.now(),
      author: user?.username || 'Member',
      content: newPostContent,
      community: activeCommunity,
      comments: []
    };

    setPosts([postItem, ...posts]);
    setNewPostContent('');
  };

  // Handle Job Post Creation (Pro Members Only)
  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobDesc.trim()) return;

    const jobItem = {
      id: Date.now(),
      title: newJobTitle,
      company: user?.username || 'Pro Member',
      desc: newJobDesc
    };

    setJobs([jobItem, ...jobs]);
    setNewJobTitle('');
    setNewJobDesc('');
  };

  // Upgrade to Pro Tier Flow (Stripe simulation / Role update)
  const handleUpgradeToPro = async () => {
    try {
      const updatedUser = { ...user, role: 'ProMember', isPro: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('🎉 Membership Upgraded! You are now a Pro Member with full posting rights, unlimited DMs, and Job Board access.');
    } catch (err) {
      alert('Upgrade failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isProUser = user?.role === 'ProMember' || user?.isPro;

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
      
      {/* Top Navbar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff', padding: '15px 25px', borderRadius: '8px' }}>
        <div>
          <h2 style={{ margin: 0 }}>HubVibe / NicheLink Platform</h2>
          <small style={{ color: '#94a3b8' }}>Tiered Micro-Communities & Real-Time Collaboration</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>
            Welcome, <strong>{user?.username}</strong> 
            <span style={{ marginLeft: '8px', fontSize: '11px', padding: '3px 8px', backgroundColor: isProUser ? '#f59e0b' : '#475569', borderRadius: '4px', fontWeight: 'bold' }}>
              {isProUser ? 'PRO MEMBER' : 'FREE MEMBER'}
            </span>
          </span>
          {!isProUser && (
            <button onClick={handleUpgradeToPro} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⭐ Upgrade to Pro
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        {/* Left Sidebar: Communities Tribes */}
        <div style={{ width: '260px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ marginTop: 0, color: '#1e293b' }}>Niche Communities (Tribes)</h4>
          {['SaaS Developers', 'Digital Nomads', 'Technical Writers'].map((comm) => (
            <div 
              key={comm} 
              onClick={() => setActiveCommunity(comm)}
              style={{ 
                padding: '10px 12px', 
                marginBottom: '8px', 
                backgroundColor: activeCommunity === comm ? '#2563eb' : '#f1f5f9', 
                color: activeCommunity === comm ? '#fff' : '#334155', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: activeCommunity === comm ? 'bold' : 'normal',
                transition: 'background 0.2s'
              }}
            >
              # {comm}
            </div>
          ))}

          <hr style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

          <h4 style={{ color: '#1e293b' }}>Navigation Tabs</h4>
          <button onClick={() => setActiveTab('feed')} style={{ width: '100%', padding: '10px', marginBottom: '8px', backgroundColor: activeTab === 'feed' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'feed' ? 'bold' : 'normal' }}>
            📰 Discussion Feed
          </button>
          <button onClick={() => setActiveTab('chat')} style={{ width: '100%', padding: '10px', marginBottom: '8px', backgroundColor: activeTab === 'chat' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'chat' ? 'bold' : 'normal' }}>
            💬 Real-Time Live Chat
          </button>
          <button onClick={() => setActiveTab('jobs')} style={{ width: '100%', padding: '10px', backgroundColor: activeTab === 'jobs' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'jobs' ? 'bold' : 'normal' }}>
            💼 Job Board / Matches {isProUser ? '' : '🔒'}
          </button>
        </div>

        {/* Right Content Pane */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Active Tribe: #{activeCommunity}</h3>

          {/* TAB 1: DISCUSSION BOARD & POSTS */}
          {activeTab === 'feed' && (
            <div>
              <form onSubmit={handleCreatePost} style={{ marginBottom: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Create Post in #{activeCommunity}</h4>
                <textarea
                  rows="3"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share code snippet, ask questions, or start a discussion..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', outline: 'none' }}
                />
                <button type="submit" style={{ marginTop: '10px', padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Publish Post
                </button>
              </form>

              <div>
                {posts.filter(p => p.community === activeCommunity).length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No posts yet in this community. Be the first to share!</p>
                ) : (
                  posts.filter(p => p.community === activeCommunity).map((post) => (
                    <div key={post.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: '#2563eb' }}>{post.author}</strong>
                        <small style={{ color: '#64748b' }}>#{post.community}</small>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '15px' }}>{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME SOCKET CHAT */}
          {activeTab === 'chat' && (
            <div>
              <div style={{ border: '1px solid #e2e8f0', height: '340px', overflowY: 'scroll', padding: '12px', marginBottom: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '130px' }}>No live messages yet. Say hi to your peers!</p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#2563eb' }}>{msg.sender}</strong>
                        <small style={{ color: '#94a3b8' }}>{msg.timestamp}</small>
                      </div>
                      <div style={{ color: '#334155' }}>{msg.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${activeCommunity} in real-time...`}
                  style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: JOB BOARD / PROJECT MATCH (PRO FEATURE) */}
          {activeTab === 'jobs' && (
            <div>
              <h4 style={{ marginTop: 0 }}>Collaboration & Project Match Board</h4>
              {!isProUser ? (
                <div style={{ padding: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#b45309' }}>🔒 Pro Member Feature Required</h3>
                  <p style={{ color: '#92400e', marginBottom: '20px' }}>Upgrade to Pro to view exclusive collaboration matches and post remote job openings.</p>
                  <button onClick={handleUpgradeToPro} style={{ padding: '12px 25px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Upgrade to Pro Now
                  </button>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleCreateJob} style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Post Collaboration Request</h4>
                    <input
                      type="text"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="Project / Role Title (e.g. MERN Partner Needed)"
                      style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <textarea
                      rows="2"
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      placeholder="Brief description of project requirements..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    />
                    <button type="submit" style={{ marginTop: '8px', padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Post Job Listing
                    </button>
                  </form>

                  <div>
                    {jobs.map((job) => (
                      <div key={job.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#fff' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{job.title}</h4>
                        <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '14px' }}>{job.desc}</p>
                        <small style={{ color: '#2563eb', fontWeight: 'bold' }}>Posted by: {job.company}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = 'Dashboard';

export default Dashboard;