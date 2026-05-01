import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back! 🎉');
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        {/* Logo */}
        <div className="fade-in" style={{ textAlign:'center', marginBottom:'36px' }}>
          <div className="float-anim" style={{ display:'inline-block', marginBottom:'16px' }}>
            <div style={{ width:64, height:64, borderRadius:'18px', background:'linear-gradient(135deg,#1a56db,#1e40af)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto', boxShadow:'0 10px 30px rgba(26,86,219,0.4)' }}>
              💳
            </div>
          </div>
          <h1 style={{ fontSize:'28px', fontWeight:800, background:'linear-gradient(135deg,#fff,#8eafd4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            ScotisLoan
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'4px' }}>Get up to ₹5 Lakh — No Collateral Required</p>
        </div>

        <div className="glass-card fade-in" style={{ padding:'36px', animationDelay:'0.1s' }}>
          <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'6px' }}>Welcome back</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'28px' }}>Sign in to manage your loan account</p>

          {err && <div className="alert alert-error">⚠️ {err}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input className="form-input" name="email" type="email" placeholder="you@email.com"
                  value={form.email} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input className="form-input" name="password" type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={handle} required />
                <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div style={{ textAlign:'right', marginBottom:'20px' }}>
              <Link to="/forgot-password" style={{ fontSize:'13px', color:'var(--primary-light)' }}>Forgot Password?</Link>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider"><span>OR</span></div>
          <p style={{ textAlign:'center', fontSize:'14px', color:'var(--text-secondary)' }}>
            Don't have an account? {' '}
            <Link to="/signup" style={{ color:'var(--primary-light)', fontWeight:600 }}>Create Account</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="fade-in" style={{ display:'flex', justifyContent:'center', gap:'20px', marginTop:'24px', animationDelay:'0.2s' }}>
          {['🔒 256-bit SSL', '🏦 RBI Approved', '⚡ Instant Approval'].map(b => (
            <span key={b} style={{ fontSize:'11px', color:'var(--text-muted)' }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
