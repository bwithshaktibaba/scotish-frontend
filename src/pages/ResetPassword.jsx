import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const nav = useNavigate();
  const loc = useLocation();
  const email = loc.state?.email || '';
  const [otp, setOtp] = useState(['','','','','','']);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleOtp = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) inputs.current[idx+1]?.focus();
  };
  const handleKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx-1]?.focus();
  };

  const submit = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter 6-digit OTP'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password`, { email, otp: code, newPassword: password });
      toast.success('Password reset successfully!');
      nav('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div className="glass-card fade-in" style={{ padding:'40px' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:48, marginBottom:'12px' }}>🔐</div>
            <h2 style={{ fontSize:'22px', fontWeight:700 }}>Reset Password</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginTop:'8px' }}>Enter the OTP sent to your email</p>
          </div>
          <form onSubmit={submit}>
            <div style={{ marginBottom:'24px' }}>
              <label className="form-label" style={{ display:'block', marginBottom:'10px' }}>Enter 6-Digit OTP</label>
              <div className="otp-container">
                {otp.map((d, i) => (
                  <input key={i} ref={el => inputs.current[i]=el}
                    className="otp-input" maxLength={1} value={d}
                    onChange={e => handleOtp(e.target.value, i)}
                    onKeyDown={e => handleKey(e, i)} autoFocus={i===0} />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input className="form-input" type={showPwd ? 'text' : 'password'}
                  placeholder="Min 8 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Resetting...' : 'Reset Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
