import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'https://hubvibe-backend.onrender.com';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'jobs'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState('SaaS Developers');
  
  // Post management state
  const [posts, setPosts] = useState([
    { id: 1, author: 'Savant', content: 'Welcome to HubVibe community! Excited to collaborate.', community: 'SaaS Developers', likes: 3 },
    { id: 2, author: 'Ayushi', content: 'Looking for full-stack developers for a MERN project.', community: 'Digital Nomads', likes: 5 }
  ]);
  const [newPost, setNewPost] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (e) {
      console.error("Error parsing user context", e);
    }

    // Socket.io connection
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('receiveMessage', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => newSocket.close();
  }, [navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        sender: user?.username || 'User',
        text: newMessage,
        community: activeCommunity,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    // Free members can post to public communities
    const createdPost = {
      id: Date.now(),
      author: user?.username || 'User',
      content: newPost,
      community: activeCommunity,
      likes: 0
    };

    setPosts([createdPost, ...posts]);
    setNewPost('');
  };

  const handleUpgradeToPro = async () => {
    try {
      // Simulate backend PRO role upgrade
      const updatedUser = { ...user, role: 'ProMember', isPro: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('🎉 Membership Upgraded! You are now a Pro Member with access to Job Board and Pro Communities.');
    } catch (err) {
      alert('Upgrade failed. Try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const usernameToDisplay = user?.username || 'Member';
  const isProUser = user?.role === 'ProMember' || user?.isPro;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff', padding: '15px 20px', borderRadius: '8px' }}>
        <div>
          <h2 style={{ margin: 0 }}>HubVibe Platform</h2>
          <small style={{ color: '#94a3b8' }}>Community & Real-time Collaboration</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Welcome, <strong>{usernameToDisplay}</strong> <span style={{ fontSize: '12px', padding: '2px 6px', backgroundColor: isProUser ? '#f59e0b' : '#64748b', borderRadius: '4px' }}>{isProUser ? 'PRO' : 'Free'}</span></span>
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

      {/* Main Container */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Sidebar */}
        <div style={{ width: '240px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4>Niche Communities</h4>
          {['SaaS Developers', 'Digital Nomads', 'Technical Writers'].map((comm) => (
            <div 
              key={comm} 
              onClick={() => setActiveCommunity(comm)}
              style={{ 
                padding: '10px', 
                marginBottom: '8px', 
                backgroundColor: activeCommunity === comm ? '#2563eb' : '#fff', 
                color: activeCommunity === comm ? '#fff' : '#334155', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: activeCommunity === comm ? 'bold' : 'normal',
                border: '1px solid #cbd5e1'
              }}
            >
              # {comm}
            </div>
          ))}

          <hr style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

          <h4>Navigation</h4>
          <button onClick={() => setActiveTab('feed')} style={{ width: '100%', padding: '8px', marginBottom: '8px', backgroundColor: activeTab === 'feed' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}>
            📰 Discussion Feed
          </button>
          <button onClick={() => setActiveTab('chat')} style={{ width: '100%', padding: '8px', marginBottom: '8px', backgroundColor: activeTab === 'chat' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}>
            💬 Live Community Chat
          </button>
          <button onClick={() => setActiveTab('jobs')} style={{ width: '100%', padding: '8px', backgroundColor: activeTab === 'jobs' ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}>
            💼 Job Board / Matches {isProUser ? '' : '🔒'}
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0 }}>Community: #{activeCommunity}</h3>

          {/* TAB 1: DISCUSSION FEED */}
          {activeTab === 'feed' && (
            <div>
              <form onSubmit={handleCreatePost} style={{ marginBottom: '20px' }}>
                <textarea
                  rows="3"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`Share something with #${activeCommunity}...`}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
                <button type="submit" style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Post Update
                </button>
              </form>

              <div>
                {posts.filter(p => p.community === activeCommunity).length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No posts in this community yet.</p>
                ) : (
                  posts.filter(p => p.community === activeCommunity).map((post) => (
                    <div key={post.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '10px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong>{post.author}</strong>
                        <small style={{ color: '#64748b' }}>#{post.community}</small>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#334155' }}>{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME LIVE CHAT */}
          {activeTab === 'chat' && (
            <div>
              <div style={{ border: '1px solid #e2e8f0', height: '320px', overflowY: 'scroll', padding: '10px', marginBottom: '15px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '120px' }}>No live messages yet. Say hi to the tribe!</p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>{msg.sender}</strong> <small style={{ color: '#94a3b8' }}>({msg.timestamp})</small>: {msg.text}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: JOB BOARD (PRO FEATURE) */}
          {activeTab === 'jobs' && (
            <div>
              <h4>Collaboration & Job Matches</h4>
              {!isProUser ? (
                <div style={{ padding: '30px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a', textAlign: 'center' }}>
                  <h3>🔒 Pro Member Feature</h3>
                  <p>Upgrade to Pro to view and post collaboration requests & job postings!</p>
                  <button onClick={handleUpgradeToPro} style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Upgrade Now
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '10px', backgroundColor: '#f8fafc' }}>
                    <strong>Frontend React Dev Needed for SaaS App</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#475569' }}>Looking for a partner to build a full-stack MERN platform. Equity share.</p>
                    <small style={{ color: '#2563eb' }}>Posted by: ProMember</small>
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

export default Dashboard;