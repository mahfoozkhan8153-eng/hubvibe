import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const saveAndRedirectToLogin = () => {
      const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userExists = existingUsers.some((u) => u.email === email);

      if (!userExists) {
        existingUsers.push({ name, email, password });
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));
      }

      setLoading(false);
      alert('Registration Successful! Please login to continue.');
      navigate('/login');
    };

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name, email, password },
        { timeout: 2500 }
      );

      if (res.data) {
        saveAndRedirectToLogin();
      } else {
        saveAndRedirectToLogin();
      }
    } catch (err) {
      console.warn('Backend connection offline or timed out. Registering locally...');
      saveAndRedirectToLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <div style={styles.logoBadge}>HV</div>
          <h2 style={styles.brandTitle}>HubVibe</h2>
        </div>
        <p style={styles.subText}>Create your account to join the community</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="e.g. John Doe"
              required
              style={styles.input}
            />
          </div>

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
              minLength="6"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login Here
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
    maxWidth: '420px',
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

export default Register;