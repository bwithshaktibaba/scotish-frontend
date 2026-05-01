import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCalendar, FiDollarSign, FiMapPin, FiBriefcase, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PYAPI = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

const LOAN_AMOUNTS = [50000,100000,150000,200000,300000,400000,500000];
const TENURES = [6,12,18,24,36,48,60];
const PURPOSES = ['Medical Emergency','Education','Home Renovation','Wedding','Business','Travel','Debt Consolidation','Other'];

function EMICalc({ amount, tenure }) {
  const rate = 10.5 / 12 / 100;
  const emi = amount && tenure ? Math.round(amount * rate * Math.pow(1+rate,tenure) / (Math.pow(1+rate,tenure)-1)) : 0;
  const total = emi * tenure;
  const interest = total - amount;
  return (
    <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'14px', padding:'20px', marginBottom:'20px' }}>
      <p style={{ fontSize:'13px', color:'#6ee7b7', fontWeight:600, marginBottom:'14px' }}>📊 Loan EMI Estimate</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', textAlign:'center' }}>
        {[['Monthly EMI', `₹${emi.toLocaleString()}`, '#10b981'],
          ['Total Interest', `₹${interest.toLocaleString()}`, '#f59e0b'],
          ['Total Payable', `₹${total.toLocaleString()}`, '#3b82f6']].map(([l,v,c]) => (
          <div key={l}>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>{l}</p>
            <p style={{ fontSize:'18px', fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoanForm() {
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [idCheck, setIdCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({
    fullName:'', nationalId:'', dob:'', gender:'', email:'', phone:'',
    address:'', city:'', state:'', pincode:'',
    occupation:'', employer:'', monthlyIncome:'', panCard:'',
    loanAmount:100000, tenure:12, loanPurpose:'',
    bankName:'', accountNumber:'', ifscCode:'',
  });

  const h = e => setForm({ ...form, [e.target.name]: e.target.value });

  const checkNationalId = async () => {
    if (!form.nationalId || form.nationalId.length < 12) { toast.error('Enter valid 12-digit Aadhaar'); return; }
    setChecking(true);
    try {
      const { data } = await axios.post(`${PYAPI}/verify-id`, { national_id: form.nationalId });
      setIdCheck(data);
      if (data.found) {
        setForm(f => ({ ...f, ...data.prefill }));
        toast.success('✅ Aadhaar verified & details prefilled!');
      } else { toast.warning('Aadhaar not found in records'); }
    } catch { toast.error('Verification service unavailable'); }
    finally { setChecking(false); }
  };

  const submitLoan = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/loan/apply`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('OTP sent to your email for confirmation!');
      nav('/loan-otp', { state: { loanId: data.loanId, email: data.email, loanAmount: form.loanAmount } });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  const steps = ['Personal Info', 'Address & Work', 'Loan Details', 'Bank Details'];

  return (
    <div style={{ minHeight:'100vh', position:'relative', zIndex:1 }}>
      {/* Top bar */}
      <nav style={{ background:'rgba(13,27,46,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px', position:'sticky', top:0, zIndex:100 }}>
        <button onClick={() => nav('/dashboard')} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'14px' }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight:700, color:'var(--text-primary)' }}>Loan Application</span>
        <div className="badge badge-warning">Zero Collateral</div>
      </nav>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'32px 20px' }}>
        {/* Step Progress */}
        <div className="fade-in" style={{ display:'flex', gap:'8px', marginBottom:'32px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex:1 }}>
              <div style={{ height:4, borderRadius:'2px', background: i+1 <= step ? 'var(--primary)' : 'rgba(255,255,255,0.08)', transition:'background 0.3s', marginBottom:'8px' }} />
              <p style={{ fontSize:'11px', color: i+1===step ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: i+1===step ? 600 : 400 }}>{s}</p>
            </div>
          ))}
        </div>

        <div className="glass-card fade-in" style={{ padding:'32px' }}>
          {/* STEP 1: Personal */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize:'20px', fontWeight:700, marginBottom:'6px' }}>Personal Information</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'24px' }}>Enter your details exactly as on your Aadhaar card</p>

              {/* National ID section */}
              <div style={{ background:'rgba(26,86,219,0.06)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px', marginBottom:'24px' }}>
                <p style={{ fontWeight:600, fontSize:'14px', marginBottom:'14px' }}>🆔 Aadhaar Verification (Instant Prefill)</p>
                <div style={{ display:'flex', gap:'10px' }}>
                  <input className="form-input" name="nationalId" placeholder="Enter 12-digit Aadhaar number"
                    value={form.nationalId} onChange={h} maxLength={12} style={{ flex:1 }} />
                  <button onClick={checkNationalId} disabled={checking}
                    style={{ background:'linear-gradient(135deg,#1a56db,#1e40af)', border:'none', borderRadius:'12px', padding:'14px 20px', color:'#fff', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', minWidth:'120px', opacity:checking?0.7:1 }}>
                    {checking ? '⏳...' : '🔍 Verify'}
                  </button>
                </div>
                {idCheck && (
                  <div style={{ marginTop:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px' }}>
                    {idCheck.found
                      ? <><span style={{ color:'#10b981' }}>✅ Verified</span><span style={{ color:'var(--text-secondary)' }}>Credit Score: <strong style={{ color: idCheck.score>=650?'#10b981':'#ef4444' }}>{idCheck.score}</strong></span></>
                      : <span style={{ color:'#ef4444' }}>❌ Not found in records</span>}
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                {[
                  { name:'fullName', label:'Full Name', placeholder:'As per Aadhaar', type:'text' },
                  { name:'email', label:'Email Address', placeholder:'your@email.com', type:'email' },
                  { name:'phone', label:'Phone Number', placeholder:'+91 XXXXX XXXXX', type:'tel' },
                  { name:'panCard', label:'PAN Card Number', placeholder:'ABCDE1234F', type:'text' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" name={f.name} type={f.type} placeholder={f.placeholder}
                      value={form[f.name]} onChange={h} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" name="dob" type="date" value={form.dob} onChange={h} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" name="gender" value={form.gender} onChange={h}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setStep(2)}>Next: Address & Work →</button>
            </div>
          )}

          {/* STEP 2: Address & Work */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize:'20px', fontWeight:700, marginBottom:'6px' }}>Address & Employment</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'24px' }}>Your residential and employment details</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Full Address</label>
                  <input className="form-input" name="address" placeholder="House No, Street, Locality"
                    value={form.address} onChange={h} />
                </div>
                {[
                  { name:'city', label:'City', placeholder:'Mumbai' },
                  { name:'state', label:'State', placeholder:'Maharashtra' },
                  { name:'pincode', label:'PIN Code', placeholder:'400001' },
                  { name:'occupation', label:'Occupation', placeholder:'Salaried / Self-employed' },
                  { name:'employer', label:'Employer / Business Name', placeholder:'Company name' },
                  { name:'monthlyIncome', label:'Monthly Income (₹)', placeholder:'50000' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" name={f.name} placeholder={f.placeholder}
                      value={form[f.name]} onChange={h} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)}>Next: Loan Details →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Loan Details */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize:'20px', fontWeight:700, marginBottom:'6px' }}>Loan Details</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'24px' }}>Select your loan amount and repayment tenure</p>

              <div className="form-group">
                <label className="form-label">Loan Amount</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'8px' }}>
                  {LOAN_AMOUNTS.map(a => (
                    <button key={a} onClick={() => setForm(f=>({...f,loanAmount:a}))}
                      style={{ padding:'10px 16px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer', border: form.loanAmount===a ? '2px solid var(--primary-light)' : '1.5px solid var(--border)', background: form.loanAmount===a ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', color: form.loanAmount===a ? 'var(--primary-light)' : 'var(--text-secondary)', transition:'all 0.2s' }}>
                      ₹{(a/1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
                <input type="range" min={10000} max={500000} step={10000} value={form.loanAmount}
                  onChange={e => setForm(f=>({...f,loanAmount:+e.target.value}))}
                  style={{ width:'100%', accentColor:'var(--primary)' }} />
                <p style={{ textAlign:'center', fontWeight:700, fontSize:'22px', color:'var(--primary-light)', marginTop:'8px' }}>₹{form.loanAmount.toLocaleString()}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Repayment Tenure</label>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  {TENURES.map(t => (
                    <button key={t} onClick={() => setForm(f=>({...f,tenure:t}))}
                      style={{ padding:'10px 18px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer', border: form.tenure===t ? '2px solid var(--accent)' : '1.5px solid var(--border)', background: form.tenure===t ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', color: form.tenure===t ? '#fbbf24' : 'var(--text-secondary)', transition:'all 0.2s' }}>
                      {t}M
                    </button>
                  ))}
                </div>
              </div>

              <EMICalc amount={form.loanAmount} tenure={form.tenure} />

              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <select className="form-input" name="loanPurpose" value={form.loanPurpose} onChange={h}>
                  <option value="">Select purpose</option>
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(4)}>Next: Bank Details →</button>
              </div>
            </div>
          )}

          {/* STEP 4: Bank */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize:'20px', fontWeight:700, marginBottom:'6px' }}>Bank Account Details</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', marginBottom:'24px' }}>Loan amount will be transferred to this account</p>

              <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'24px', fontSize:'13px', color:'#fbbf24' }}>
                🔒 Your bank details are encrypted and securely stored
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                {[
                  { name:'bankName', label:'Bank Name', placeholder:'State Bank of India', full:true },
                  { name:'accountNumber', label:'Account Number', placeholder:'XXXXXXXXXXXXXXXX' },
                  { name:'ifscCode', label:'IFSC Code', placeholder:'SBIN0000001' },
                ].map(f => (
                  <div className="form-group" key={f.name} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" name={f.name} placeholder={f.placeholder}
                      value={form[f.name]} onChange={h} />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background:'rgba(26,86,219,0.08)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px', marginBottom:'24px' }}>
                <p style={{ fontWeight:600, fontSize:'14px', marginBottom:'14px' }}>📋 Application Summary</p>
                <div style={{ display:'grid', gap:'8px', fontSize:'14px' }}>
                  {[
                    ['Applicant', form.fullName],
                    ['Loan Amount', `₹${form.loanAmount?.toLocaleString()}`],
                    ['Tenure', `${form.tenure} months`],
                    ['Purpose', form.loanPurpose],
                    ['Monthly EMI', `₹${Math.round(form.loanAmount*(10.5/12/100)*Math.pow(1+(10.5/12/100),form.tenure)/(Math.pow(1+(10.5/12/100),form.tenure)-1)).toLocaleString()}`],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-secondary)' }}>{k}</span>
                      <span style={{ fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn-outline" onClick={() => setStep(3)}>← Back</button>
                <button className="btn-primary" onClick={submitLoan} disabled={loading}>
                  {loading ? '⏳ Submitting...' : '🚀 Submit & Get OTP'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
