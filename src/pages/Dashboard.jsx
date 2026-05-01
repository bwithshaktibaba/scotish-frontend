import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiFileText, FiUser, FiTrendingUp, FiShield } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SCORE_COLORS = s => s >= 750 ? '#10b981' : s >= 650 ? '#f59e0b' : '#ef4444';
const SCORE_LABEL = s => s >= 750 ? 'Excellent' : s >= 650 ? 'Good — Eligible' : 'Below Threshold';

export default function Dashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const [loanData, setLoanData] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [lRes, sRes] = await Promise.all([
          axios.get(`${API}/api/loan/my-loans`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API}/api/score/my-score`, { headers }).catch(() => ({ data: null })),
        ]);
        setLoanData(lRes.data);
        setScore(sRes.data?.score || null);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const logout = () => { localStorage.clear(); nav('/login'); };

  const creditScore = score || 720;
  const scoreColor = SCORE_COLORS(creditScore);
  const scoreLabel = SCORE_LABEL(creditScore);
  const eligible = creditScore >= 650;
  const pct = Math.round((creditScore / 900) * 360);

  return (
    <div style={{ minHeight:'100vh', position:'relative', zIndex:1 }}>
      {/* Navbar */}
      <nav style={{ background:'rgba(13,27,46,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:24 }}>💳</span>
          <span style={{ fontWeight:800, fontSize:'18px', background:'linear-gradient(135deg,#fff,#8eafd4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ScotisLoan</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <span style={{ fontSize:'14px', color:'var(--text-secondary)' }}>Hi, {user.fullName?.split(' ')[0] || 'User'} 👋</span>
          <button onClick={logout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'8px 14px', color:'#fca5a5', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:500 }}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 20px' }}>
        {/* Hero Banner */}
        <div className="fade-in" style={{ background:'linear-gradient(135deg,#1a56db 0%,#1e40af 50%,#1e3a8a 100%)', borderRadius:'24px', padding:'36px 40px', marginBottom:'28px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:'-20px', top:'-20px', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', right:'60px', bottom:'-40px', width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <span style={{ background:'rgba(245,158,11,0.2)', color:'#fbbf24', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:600, border:'1px solid rgba(245,158,11,0.3)' }}>⚡ INSTANT APPROVAL</span>
            <h1 style={{ fontSize:'34px', fontWeight:800, marginTop:'16px', marginBottom:'8px', lineHeight:1.2 }}>
              Get Up to <span style={{ color:'#fbbf24' }}>₹5,00,000</span><br/>With Zero Collateral
            </h1>
            <p style={{ fontSize:'15px', opacity:0.85, marginBottom:'24px' }}>No guarantor needed • 100% Digital Process • Disbursed in 24 hrs</p>
            {eligible ? (
              <button className="btn-accent" style={{ width:'auto', padding:'14px 32px', fontSize:'16px' }}
                onClick={() => nav('/apply-loan')}>
                Apply for Loan Now →
              </button>
            ) : (
              <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', padding:'12px 20px', display:'inline-block', color:'#fca5a5', fontSize:'14px' }}>
                ⚠️ Your credit score is below 650 — not eligible at this time
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'16px', marginBottom:'28px', animationDelay:'0.1s' }}>
          {/* Credit Score Card */}
          <div className="glass-card" style={{ padding:'24px', display:'flex', gap:'20px', alignItems:'center' }}>
            <div style={{ position:'relative', width:80, height:80, flexShrink:0 }}>
              <svg viewBox="0 0 36 36" style={{ width:80, height:80, transform:'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${(creditScore/900)*100} 100`} strokeLinecap="round" />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                <span style={{ fontSize:'14px', fontWeight:800, color:scoreColor }}>{creditScore}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px' }}>CREDIT SCORE</p>
              <p style={{ fontSize:'18px', fontWeight:700 }}>{scoreLabel}</p>
              <span className={`badge ${eligible ? 'badge-success' : 'badge-danger'}`} style={{ marginTop:'6px', fontSize:'11px' }}>
                {eligible ? '✓ Eligible' : '✗ Not Eligible'}
              </span>
            </div>
          </div>

          {[
            { icon:'💰', label:'MAX LOAN AMOUNT', value:'₹5,00,000', sub:'No collateral needed', color:'#10b981' },
            { icon:'📅', label:'MAX TENURE', value:'60 Months', sub:'Flexible repayment', color:'#3b82f6' },
            { icon:'📊', label:'INTEREST RATE', value:'10.5% p.a.', sub:'Competitive rates', color:'#f59e0b' },
          ].map(c => (
            <div key={c.label} className="glass-card" style={{ padding:'24px' }}>
              <div style={{ fontSize:28, marginBottom:'10px' }}>{c.icon}</div>
              <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>{c.label}</p>
              <p style={{ fontSize:'22px', fontWeight:700, color:c.color }}>{c.value}</p>
              <p style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px' }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="fade-in glass-card" style={{ padding:'28px', animationDelay:'0.2s' }}>
          <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>Why Choose ScotisLoan?</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'16px' }}>
            {[
              { icon:'⚡', title:'Instant Approval', desc:'Get approved in under 60 seconds' },
              { icon:'🔒', title:'100% Secure', desc:'Bank-grade 256-bit SSL encryption' },
              { icon:'📱', title:'Fully Digital', desc:'No paperwork, no branch visits' },
              { icon:'🏦', title:'No Collateral', desc:'Zero assets required as security' },
            ].map(f => (
              <div key={f.title} style={{ background:'rgba(26,86,219,0.06)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px' }}>
                <div style={{ fontSize:28, marginBottom:'10px' }}>{f.icon}</div>
                <p style={{ fontWeight:600, fontSize:'14px', marginBottom:'4px' }}>{f.title}</p>
                <p style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Loans */}
        {loanData && loanData.length > 0 && (
          <div className="fade-in glass-card" style={{ padding:'28px', marginTop:'20px', animationDelay:'0.3s' }}>
            <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>My Loan Applications</h3>
            {loanData.map((l, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:'12px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontWeight:600 }}>₹{l.loanAmount?.toLocaleString()}</p>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)' }}>{l.loanPurpose} • {l.tenure} months</p>
                </div>
                <span className={`badge ${l.status==='approved'?'badge-success':l.status==='rejected'?'badge-danger':'badge-warning'}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
