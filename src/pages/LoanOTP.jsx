import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LoanOTP() {
  const nav = useNavigate();
  const loc = useLocation();
  const { loanId, email, loanAmount } = loc.state || {};
  const [otp, setOtp] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const token = localStorage.getItem('token');

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) inputs.current[idx+1]?.focus();
  };
  const handleKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx-1]?.focus();
  };
  const handlePaste = e => {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (p.length===6) { setOtp(p.split('')); inputs.current[5]?.focus(); }
  };

  const confirm = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/loan/confirm-otp`, { loanId, otp: code },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Loan confirmed! Processing disbursement... 🎉');
      nav('/loan-success', { state: { loanAmount, loanId } });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div className="glass-card fade-in" style={{ padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:'16px' }}>🔐</div>
          <h2 style={{ fontSize:'24px', fontWeight:700, marginBottom:'8px' }}>Confirm Your Loan</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'8px' }}>
            A 6-digit OTP has been sent to
          </p>
          <p style={{ color:'var(--primary-light)', fontWeight:600, marginBottom:'16px', fontSize:'15px' }}>{email}</p>

          <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'14px', padding:'16px', marginBottom:'28px' }}>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'4px' }}>LOAN AMOUNT REQUESTED</p>
            <p style={{ fontSize:'32px', fontWeight:800, color:'#fbbf24' }}>₹{loanAmount?.toLocaleString()}</p>
          </div>

          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input key={i} ref={el => inputs.current[i]=el}
                className="otp-input" maxLength={1} value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKey(e, i)} autoFocus={i===0} />
            ))}
          </div>

          <button className="btn-accent" style={{ marginTop:'28px', fontSize:'16px', padding:'16px' }}
            onClick={confirm} disabled={loading}>
            {loading ? '⏳ Processing...' : '✓ Confirm & Disburse Loan'}
          </button>

          <p style={{ marginTop:'16px', fontSize:'13px', color:'var(--text-muted)' }}>
            By confirming, you agree to the loan terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
