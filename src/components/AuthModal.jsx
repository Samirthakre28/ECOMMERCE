import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        showToast('Logged in successfully', 'success');
      } else {
        await signUp(email, password);
        showToast('Account created! Check your email to verify.', 'success');
      }
      onClose();
    } catch (error) {
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel auth-panel active-content">
        <button className="icon-btn-close close-modal" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h2 className="auth-title">{isLogin ? 'LOGIN' : 'SIGN UP'}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="email"
              required
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email Address</label>
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              required
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
            <label>Password</label>
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            <span className="btn-text">{loading ? 'PLEASE WAIT...' : (isLogin ? 'ENTER' : 'CREATE ACCOUNT')}</span>
          </button>
        </form>
        <p className="auth-toggle">
          <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>{' '}
          <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create one' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
