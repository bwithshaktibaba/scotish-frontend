import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyOTP() {
  const nav = useNavigate();
  const loc = useLocation();
  const email = loc.state?.email || '';
  const [otp, setOtp] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx+1]?.focus();
  };
  const handleKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx-1]?.focus();
  };
  const handlePaste = e => {
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (paste.length === 6) { setOtp(paste.split('')); inputs.current[5]?.focus(); }
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/verify-otp`, { email, otp: code });
      toast.success('Email verified! Please login.');
      nav('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await axios.post(`${API}/api/auth/resend-otp`, { email });
      toast.success('OTP resent!');
      let t = 30;
      setResendTimer(t);
      const iv = setInterval(() => { t--; setResendTimer(t); if(t<=0) clearInterval(iv); }, 1000);
    } catch { toast.error('Failed to resend'); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div className="glass-card fade-in" style={{ padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:'16px' }}>📧</div>
          <h2 style={{ fontSize:'24px', fontWeight:700, marginBottom:'8px' }}>Verify Your Email</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'8px' }}>
            We've sent a 6-digit OTP to
          </p>
          <p style={{ color:'var(--primary-light)', fontWeight:600, marginBottom:'32px', fontSize:'15px' }}>{email}</p>

          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input key={i} ref={el => inputs.current[i]=el}
                className="otp-input" maxLength={1} value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKey(e, i)} autoFocus={i===0} />
            ))}
          </div>

          <button className="btn-accent" style={{ marginTop:'24px' }} onClick={verify} disabled={loading}>
            {loading ? '⏳ Verifying...' : '✓ Verify OTP'}
          </button>

          <div style={{ marginTop:'20px', fontSize:'14px', color:'var(--text-secondary)' }}>
            Didn't receive it?{' '}
            {resendTimer > 0
              ? <span style={{ color:'var(--text-muted)' }}>Resend in {resendTimer}s</span>
              : <button onClick={resend} style={{ background:'none', border:'none', color:'var(--primary-light)', cursor:'pointer', fontWeight:600, fontSize:'14px' }}>Resend OTP</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
