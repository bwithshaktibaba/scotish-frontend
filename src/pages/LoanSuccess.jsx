import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoanSuccess() {
  const nav = useNavigate();
  const loc = useLocation();
  const { loanAmount, loanId } = loc.state || {};
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [count, setCount] = useState(0);
  const accountLast2 = '42'; // simulated last 2 digits

  useEffect(() => {
    // Animate number
    let start = 0;
    const target = loanAmount || 100000;
    const step = Math.ceil(target / 60);
    const iv = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(iv);
    }, 20);
    return () => clearInterval(iv);
  }, [loanAmount]);

  const transferMsg = `Dear ${user.fullName || 'Customer'}, ₹${(loanAmount||100000).toLocaleString()} has been successfully credited to your account ending in **${accountLast2}. Reference ID: ${loanId || 'SCL'+Date.now().toString().slice(-8)}. Thank you for choosing ScotisLoan!`;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:'520px' }}>
        <div className="glass-card fade-in" style={{ padding:'48px', textAlign:'center' }}>
          {/* Success animation */}
          <div style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:44, boxShadow:'0 0 40px rgba(16,185,129,0.4)', animation:'float 2s ease-in-out infinite' }}>
            🎉
          </div>

          <h1 style={{ fontSize:'28px', fontWeight:800, marginBottom:'8px' }}>Loan Approved!</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'15px', marginBottom:'32px' }}>
            Your loan has been disbursed successfully
          </p>

          {/* Amount display */}
          <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'20px', padding:'28px', marginBottom:'28px' }}>
            <p style={{ fontSize:'13px', color:'#6ee7b7', fontWeight:600, marginBottom:'8px', letterSpacing:'1px' }}>AMOUNT TRANSFERRED</p>
            <p style={{ fontSize:'44px', fontWeight:900, color:'#10b981', letterSpacing:'-1px' }}>
              ₹{count.toLocaleString()}
            </p>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'8px' }}>
              To account ending in **{accountLast2}
            </p>
          </div>

          {/* Simulated Bank Message */}
          <div style={{ background:'rgba(26,86,219,0.08)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px', marginBottom:'28px', textAlign:'left' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
              <span style={{ fontSize:20 }}>📱</span>
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--text-secondary)' }}>BANK SMS NOTIFICATION</span>
            </div>
            <p style={{ fontSize:'13px', color:'var(--text-primary)', lineHeight:1.6 }}>
              Dear {user.fullName || 'Customer'}, <strong style={{ color:'#10b981' }}>₹{(loanAmount||100000).toLocaleString()}</strong> has been credited to your A/c ending in <strong>**{accountLast2}</strong>. Ref: SCL{loanId?.slice(-6) || Date.now().toString().slice(-6)}. Thank you for choosing ScotisLoan!
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px', textAlign:'left' }}>
            {[
              ['Transaction ID', `SCL${loanId?.slice(-8) || Date.now().toString().slice(-8)}`],
              ['Status', '✅ Disbursed'],
              ['Processing Time', '< 2 minutes'],
              ['Mode', 'NEFT / IMPS'],
            ].map(([k,v]) => (
              <div key={k} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'12px 14px' }}>
                <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>{k}</p>
                <p style={{ fontSize:'14px', fontWeight:600 }}>{v}</p>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => nav('/dashboard')}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
