import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const API_BASE_URL = 'https://hubvibe-backend.onrender.com';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
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
      console.error("Error parsing user context", e);
    }

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
        sender: user?.username || user?.name || 'User',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const usernameToDisplay = user?.username || user?.name || 'User';

  return (
    <div style={{ backgroundColor: '#0f291e', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#1a3328', border: '1px solid #334e42', borderRadius: '12px', padding: '25px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#ffffff' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334e42', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>HubVibe Live Community</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px' }}>Welcome, {usernameToDisplay}!</span>
            <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid #334e42', height: '320px', overflowY: 'scroll', padding: '12px', marginBottom: '15px', backgroundColor: '#ffffff', borderRadius: '6px', color: '#333333' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#888888', textAlign: 'center', marginTop: '120px' }}>No messages yet. Say hi to the community!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <strong>{msg.sender}</strong> <small style={{ color: '#666666' }}>({msg.timestamp})</small>: {msg.text}
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
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
}

Dashboard.displayName = 'Dashboard';

export default Dashboard;