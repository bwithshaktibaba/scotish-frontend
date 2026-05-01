import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div className="glass-card fade-in" style={{ padding:'40px' }}>
          {!sent ? (
            <>
              <div style={{ textAlign:'center', marginBottom:'28px' }}>
                <div style={{ fontSize:48, marginBottom:'12px' }}>🔑</div>
                <h2 style={{ fontSize:'22px', fontWeight:700 }}>Forgot Password?</h2>
                <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginTop:'8px' }}>
                  No worries! Enter your email and we'll send a reset OTP.
                </p>
              </div>
              <form onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input className="form-input" type="email" placeholder="you@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? '⏳ Sending...' : 'Send Reset OTP →'}
                </button>
              </form>
              <div style={{ textAlign:'center', marginTop:'20px' }}>
                <Link to="/login" style={{ fontSize:'14px', color:'var(--primary-light)' }}>← Back to Login</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:'16px' }}>✅</div>
              <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'12px' }}>Check Your Email!</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'28px' }}>
                We've sent a password reset OTP to <strong style={{ color:'var(--primary-light)' }}>{email}</strong>
              </p>
              <button className="btn-primary" onClick={() => nav('/reset-password', { state: { email } })}>
                Enter Reset OTP →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
