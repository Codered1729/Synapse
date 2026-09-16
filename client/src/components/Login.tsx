import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './Login.css';

const Login: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(email, password, 'student');
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsRegisterMode(false);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="brand-title">Synapse</h1>
          <p className="brand-subtitle">CVR Academic Resource Hub</p>
        </div>

        <div className="mode-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(false); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(true); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="e.g. student@cvr.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : isRegisterMode ? 'Create Student Account' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts-panel">
          <p className="demo-title">Quick Demo Logins (password: <code>password123</code>):</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-btn admin"
              onClick={() => fillDemoAccount('admin@synapse.com')}
            >
              👑 Admin
            </button>
            <button 
              type="button" 
              className="demo-btn student"
              onClick={() => fillDemoAccount('student@synapse.com')}
            >
              🎒 Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;