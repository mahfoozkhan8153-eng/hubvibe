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

    setUser(JSON.parse(storedUser));

    // Socket.io Client Connection to Live Render Backend
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
        sender: user?.username || 'Anonymous',
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

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>HubVibe Live Community</h2>
        {user && <span>Welcome, <strong>{user.username}</strong>!</span>}
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', height: '350px', overflowY: 'scroll', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888' }}>No messages yet. Say hi to the community!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{msg.sender}</strong> <small style={{ color: '#666' }}>({msg.timestamp})</small>: {msg.text}
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
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Dashboard;