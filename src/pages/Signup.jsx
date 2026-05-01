import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirmPassword) { setErr('Passwords do not match'); return; }
    if (form.password.length < 8) { setErr('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/signup`, form);
      toast.success('OTP sent to your email!');
      nav('/verify-otp', { state: { email: form.email } });
    } catch (e) {
      setErr(e.response?.data?.message || 'Signup failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>
        <div className="fade-in" style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:56, height:56, borderRadius:'16px', background:'linear-gradient(135deg,#1a56db,#1e40af)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px', boxShadow:'0 10px 30px rgba(26,86,219,0.4)' }}>💳</div>
          <h1 style={{ fontSize:'26px', fontWeight:800, background:'linear-gradient(135deg,#fff,#8eafd4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ScotisLoan</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'4px' }}>Get up to ₹5 Lakh — No Collateral</p>
        </div>

        <div className="glass-card fade-in" style={{ padding:'36px', animationDelay:'0.1s' }}>
          <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'6px' }}>Create Account</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'28px' }}>Start your loan journey today</p>

          {err && <div className="alert alert-error">⚠️ {err}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input className="form-input" name="fullName" placeholder="Arjun Sharma"
                  value={form.fullName} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input className="form-input" name="email" type="email" placeholder="arjun@email.com"
                  value={form.email} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input className="form-input" name="phone" placeholder="+91 98765 43210"
                  value={form.phone} onChange={handle} required />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
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
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input className="form-input" name="confirmPassword" type="password"
                    placeholder="••••••••" value={form.confirmPassword} onChange={handle} required />
                </div>
              </div>
            </div>

            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'12px 14px', marginBottom:'20px', fontSize:'13px', color:'#fbbf24', display:'flex', gap:'8px' }}>
              ⚡ <span>OTP will be sent to your email for verification</span>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Creating Account...' : 'Create Account & Get OTP →'}
            </button>
          </form>

          <div className="divider"><span>OR</span></div>
          <p style={{ textAlign:'center', fontSize:'14px', color:'var(--text-secondary)' }}>
            Already have an account? {' '}
            <Link to="/login" style={{ color:'var(--primary-light)', fontWeight:600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
