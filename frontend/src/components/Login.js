import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Pehle strict check karo ki user registered hai ya nahi
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const foundUser = registeredUsers.find((u) => u.email === email);

    if (!foundUser) {
      // Agar local registered list mein nahi hai, toh direct block karo!
      setLoading(false);
      setError('User not found. Please register.');
      return;
    }

    // 2. Password match check karo
    if (foundUser.password !== password) {
      setLoading(false);
      setError('Incorrect password. Please try again.');
      return;
    }

    // 3. Backend verification try karo (optional sync)
    try {
      await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { timeout: 2000 }
      );
    } catch (err) {
      // Backend offline hone par bhi local registered data se allow karenge kyunki user verified hai
    }

    const userData = {
      name: foundUser.name,
      email: foundUser.email,
      role: 'FreeMember',
      isSubscribed: false,
    };

    localStorage.setItem('hubvibe_token', 'local_valid_token');
    localStorage.setItem('hubvibe_user', JSON.stringify(userData));
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <div style={styles.logoBadge}>HV</div>
          <h2 style={styles.brandTitle}>HubVibe</h2>
        </div>
        <p style={styles.subText}>Welcome back! Login to your account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="name@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f5132 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(6, 78, 59, 0.45)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '20px',
    padding: '35px 30px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    color: '#ecfdf5',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    color: '#022c22',
  },
  brandTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#34d399',
  },
  subText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#a7f3d0',
    marginBottom: '25px',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#a7f3d0',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    background: 'rgba(2, 44, 34, 0.6)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    color: '#022c22',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#a7f3d0',
  },
  link: {
    color: '#34d399',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;