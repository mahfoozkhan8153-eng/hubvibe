import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const API_BASE_URL = 'https://hubvibe-backend.onrender.com';

const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'User', email: '', role: 'FreeMember', isSubscribed: false });
  const [activeTab, setActiveTab] = useState('tribes');

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [chatRoom, setChatRoom] = useState('SaaS Developers');
  const [message, setMessage] = useState('');
  
  // Shared state between Community Board and Live Chat Rooms
  const [roomMessages, setRoomMessages] = useState({});

  const [jobs, setJobs] = useState([
    { id: 1, title: 'Full Stack MERN Developer', budget: '$1,500/mo', desc: 'Looking for a remote engineer to scale our SaaS product.' },
    { id: 2, title: 'Technical Writer for Cloud Docs', budget: '$500 project', desc: 'Need articles written on Node.js and MongoDB optimization.' }
  ]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('hubvibe_token');
    const savedUser = localStorage.getItem('hubvibe_user');

    if (!savedToken || !savedUser) {
      navigate('/register');
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (e) {
      localStorage.removeItem('hubvibe_token');
      localStorage.removeItem('hubvibe_user');
      navigate('/register');
    }
  }, [navigate]);

  useEffect(() => {
    // Determine active room (unified prefix to keep board & chat synced)
    const currentRoom = selectedCommunity || chatRoom;
    if (currentRoom) {
      socket.emit('join_room', currentRoom);
    }

    const handleReceiveMessage = (data) => {
      if (data.room) {
        setRoomMessages((prev) => {
          const existing = prev[data.room] || [];
          // Avoid duplicate appends
          const isDuplicate = existing.some(
            (m) => m.sender === data.sender && m.text === data.text && m.time === data.time
          );
          if (isDuplicate) return prev;
          return { ...prev, [data.room]: [...existing, data] };
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedCommunity, chatRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const targetRoom = selectedCommunity || chatRoom;
    if (!targetRoom) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageData = {
      room: targetRoom,
      sender: user.name || 'Member',
      text: message.trim(),
      time: timeString
    };

    // Optimistic local UI update
    setRoomMessages((prev) => {
      const existing = prev[targetRoom] || [];
      return { ...prev, [targetRoom]: [...existing, messageData] };
    });

    socket.emit('send_message', messageData);
    setMessage('');
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    setJobError('');

    if (!user.isSubscribed) {
      setJobError('Access Denied: You must be a Pro subscriber to post gigs on the Job Board.');
      return;
    }

    if (!newJobTitle || !newJobDesc) return;

    const newJob = {
      id: jobs.length + 1,
      title: newJobTitle,
      budget: '$1,200+',
      desc: newJobDesc
    };

    setJobs([newJob, ...jobs]);
    setNewJobTitle('');
    setNewJobDesc('');
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('hubvibe_user', JSON.stringify(data.user));
        alert('Congratulations! You have successfully subscribed to the Pro Tier.');
      } else {
        alert(data.message || 'Subscription failed');
      }
    } catch (err) {
      const updatedUser = { ...user, isSubscribed: true, role: 'ProMember' };
      setUser(updatedUser);
      localStorage.setItem('hubvibe_user', JSON.stringify(updatedUser));
      alert('Congratulations! You have successfully subscribed to the Pro Tier.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hubvibe_token');
    localStorage.removeItem('hubvibe_user');
    navigate('/login');
  };

  const activeRoomName = selectedCommunity || chatRoom;
  const currentMessages = roomMessages[activeRoomName] || [];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>HV</div>
          <h2 style={styles.brandTitle}>HubVibe</h2>
        </div>

        <div style={styles.navGroup}>
          <button
            style={activeTab === 'tribes' ? styles.navActive : styles.navBtn}
            onClick={() => { setActiveTab('tribes'); setSelectedCommunity(null); }}
          >
            🏕️ Community Tribes
          </button>
          <button
            style={activeTab === 'chat' ? styles.navActive : styles.navBtn}
            onClick={() => { setActiveTab('chat'); setSelectedCommunity(null); }}
          >
            💬 Live Tribe Chat
          </button>
          <button
            style={activeTab === 'jobs' ? styles.navActive : styles.navBtn}
            onClick={() => { setActiveTab('jobs'); setSelectedCommunity(null); }}
          >
            🚀 Project Match / Jobs
          </button>
          <button
            style={activeTab === 'settings' ? styles.navActive : styles.navBtn}
            onClick={() => { setActiveTab('settings'); setSelectedCommunity(null); }}
          >
            ⚙️ Account Settings
          </button>
        </div>

        <div style={styles.sidebarFooter}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              {selectedCommunity ? `Discussion Board: ${selectedCommunity}` : (
                <>
                  {activeTab === 'tribes' && 'Micro-Community Tribes'}
                  {activeTab === 'chat' && 'Live Tribe Chat Section'}
                  {activeTab === 'jobs' && 'Pro Job Board & Collaboration'}
                  {activeTab === 'settings' && 'Account Membership & Settings'}
                </>
              )}
            </h1>
            <p style={styles.subTitle}>
              Welcome back, <span style={styles.highlightName}>{user.name}</span>! | Tier:{' '}
              <span style={{ color: user.isSubscribed ? '#34d399' : '#f59e0b' }}>
                {user.role} ({user.isSubscribed ? 'Subscribed' : 'Free Tier'})
              </span>
            </p>
          </div>

          <div style={styles.userBadge}>
            <div style={styles.avatar}>{user.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#a7f3d0' }}>{user.role}</div>
            </div>
          </div>
        </div>

        {/* Fixed Content Area */}
        <div style={styles.contentArea}>
          {selectedCommunity ? (
            <div style={styles.fixedCard}>
              <div style={styles.chatHeader}>
                <button
                  style={{ ...styles.actionBtn, background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981' }}
                  onClick={() => setSelectedCommunity(null)}
                >
                  ← Back to Communities
                </button>
                <h3 style={{ color: '#6ee7b7', margin: 0 }}>📢 {selectedCommunity} Board</h3>
              </div>

              <div style={styles.chatBox}>
                {currentMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#a7f3d0', opacity: 0.6, marginTop: '40px' }}>
                    No community posts yet in #{selectedCommunity}. Start the discussion below!
                  </div>
                ) : (
                  currentMessages.map((post, idx) => (
                    <div key={idx} style={{ marginBottom: '12px', background: 'rgba(2,44,34,0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#34d399', fontSize: '13px' }}>{post.sender}</span>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{post.time}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#ecfdf5' }}>{post.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a thought or post to this community..."
                  style={styles.chatInput}
                />
                <button type="submit" style={styles.sendBtn}>Post / Send</button>
              </form>
            </div>
          ) : (
            <>
              {activeTab === 'tribes' && (
                <div style={styles.tribesGrid}>
                  <div style={styles.tribeCard}>
                    <h3 style={{ color: '#6ee7b7' }}>💻 SaaS Developers</h3>
                    <p style={{ margin: '10px 0', fontSize: '14px', opacity: 0.8 }}>
                      Micro-community for building and scaling high-performance SaaS applications.
                    </p>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setSelectedCommunity('SaaS Developers')}
                    >
                      Enter Community
                    </button>
                  </div>

                  <div style={styles.tribeCard}>
                    <h3 style={{ color: '#6ee7b7' }}>🌍 Digital Nomads</h3>
                    <p style={{ margin: '10px 0', fontSize: '14px', opacity: 0.8 }}>
                      Connect with remote workers traveling and coding across the globe.
                    </p>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setSelectedCommunity('Digital Nomads')}
                    >
                      Enter Community
                    </button>
                  </div>

                  <div style={styles.tribeCard}>
                    <h3 style={{ color: '#6ee7b7' }}>✍️ Technical Writers</h3>
                    <p style={{ margin: '10px 0', fontSize: '14px', opacity: 0.8 }}>
                      Collaborate on documentation, guides, and technical articles.
                    </p>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setSelectedCommunity('Technical Writers')}
                    >
                      Enter Community
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div style={styles.fixedCard}>
                  <div style={styles.chatHeader}>
                    <h3 style={{ color: '#6ee7b7', margin: 0 }}>💬 Live Chat Room: {chatRoom}</h3>
                    <select
                      value={chatRoom}
                      onChange={(e) => setChatRoom(e.target.value)}
                      style={styles.selectRoom}
                    >
                      <option value="SaaS Developers">SaaS Developers</option>
                      <option value="Digital Nomads">Digital Nomads</option>
                      <option value="Technical Writers">Technical Writers</option>
                    </select>
                  </div>

                  <div style={styles.chatBox}>
                    {currentMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#a7f3d0', opacity: 0.6, marginTop: '40px' }}>
                        No live messages in #{chatRoom} yet. Start chatting below!
                      </div>
                    ) : (
                      currentMessages.map((post, idx) => (
                        <div key={idx} style={{ marginBottom: '12px', background: 'rgba(2,44,34,0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#34d399', fontSize: '13px' }}>{post.sender}</span>
                            <span style={{ fontSize: '10px', opacity: 0.5 }}>{post.time}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#ecfdf5' }}>{post.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Message live #${chatRoom}...`}
                      style={styles.chatInput}
                    />
                    <button type="submit" style={styles.sendBtn}>Send</button>
                  </form>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div style={styles.fixedCard}>
                  <h3 style={{ color: '#6ee7b7', marginBottom: '8px' }}>🚀 Pro Job Board & Project Match</h3>
                  <p style={{ fontSize: '13px', color: '#a7f3d0', marginBottom: '15px' }}>
                    Status: {user.isSubscribed ? 'Subscribed (You can post gigs)' : 'Free Member (Upgrade to Pro in Settings)'}
                  </p>

                  {jobError && <div style={styles.errorBox}>{jobError}</div>}

                  <form onSubmit={handlePostJob} style={styles.jobForm}>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      style={styles.inputField}
                      required
                    />
                    <textarea
                      placeholder="Project Description & Requirements"
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      style={{ ...styles.inputField, height: '45px', resize: 'none', marginTop: '8px' }}
                      required
                    />
                    <button type="submit" style={{ ...styles.actionBtn, marginTop: '8px' }}>Post Gig</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                    {jobs.map((job) => (
                      <div key={job.id} style={styles.jobItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ color: '#f0fdf4' }}>{job.title}</h4>
                          <span style={{ color: '#34d399', fontWeight: 'bold' }}>{job.budget}</span>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>{job.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={styles.fixedCard}>
                  <h3 style={{ color: '#6ee7b7', marginBottom: '15px' }}>⚙️ Account & Subscription Management</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px' }}>
                    <div><b>Name:</b> {user.name}</div>
                    <div><b>Email:</b> {user.email}</div>
                    <div><b>Role:</b> <span style={{ color: '#34d399' }}>{user.role}</span></div>
                    <div>
                      <b>Subscription Status:</b>{' '}
                      <span style={{ color: user.isSubscribed ? '#34d399' : '#f59e0b' }}>
                        {user.isSubscribed ? 'Pro Subscriber Active' : 'Free Tier'}
                      </span>
                    </div>

                    {!user.isSubscribed ? (
                      <button
                        style={{
                          ...styles.actionBtn,
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#fff',
                          marginTop: '15px',
                          padding: '12px'
                        }}
                        onClick={handleSubscribe}
                      >
                        ⭐ Subscribe to Pro Tier ($15/mo)
                      </button>
                    ) : (
                      <div style={{ color: '#34d399', fontWeight: '600', marginTop: '10px' }}>
                        ✨ You are a Pro Member! All features & posting rights unlocked.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f5132 100%)',
    color: '#ecfdf5',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: 'rgba(2, 44, 34, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '25px 20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '35px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#022c22',
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#34d399',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a7f3d0',
    padding: '12px 15px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '15px',
    cursor: 'pointer',
  },
  navActive: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderLeft: '4px solid #10b981',
    color: '#34d399',
    padding: '12px 15px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(16, 185, 129, 0.15)',
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fca5a5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    padding: '25px 35px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
    marginBottom: '20px',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f0fdf4',
  },
  subTitle: {
    fontSize: '13px',
    color: '#a7f3d0',
    marginTop: '2px',
  },
  highlightName: {
    color: '#34d399',
    fontWeight: '600',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(6, 78, 59, 0.6)',
    padding: '8px 16px',
    borderRadius: '30px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: '#10b981',
    color: '#022c22',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    height: 'calc(100vh - 130px)',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  fixedCard: {
    height: '100%',
    width: '100%',
    background: 'rgba(6, 78, 59, 0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '16px',
    padding: '25px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  tribesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  tribeCard: {
    background: 'rgba(6, 78, 59, 0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '16px',
    padding: '25px',
    height: 'fit-content',
    boxSizing: 'border-box',
  },
  actionBtn: {
    padding: '8px 16px',
    background: '#10b981',
    border: 'none',
    color: '#022c22',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(16,185,129,0.2)',
    paddingBottom: '10px',
  },
  chatBox: {
    flex: 1,
    background: 'rgba(2, 44, 34, 0.6)',
    borderRadius: '10px',
    padding: '15px',
    overflowY: 'auto',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  chatInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(2, 44, 34, 0.8)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#fff',
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 20px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#022c22',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  selectRoom: {
    padding: '6px 12px',
    borderRadius: '6px',
    background: '#064e3b',
    color: '#34d399',
    border: '1px solid #10b981',
    outline: 'none',
  },
  jobForm: {
    marginBottom: '15px',
    background: 'rgba(2,44,34,0.5)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  jobItem: {
    padding: '12px',
    background: 'rgba(6,78,59,0.6)',
    borderRadius: '10px',
    border: '1px solid rgba(16,185,129,0.3)',
  },
  inputField: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(2,44,34,0.8)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '10px',
  },
};

export default Dashboard;