import React, { useState } from 'react';
import { FarmSolLogo } from './components/FarmSolLogo';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  // Auth & RBAC State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [emailInput, setEmailInput] = useState<string>('pardhupavan459@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('Pavan@2026Secure!');

  // Admin Workspace Tabs & Search
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals
  const [showAddCropModal, setShowAddCropModal] = useState<boolean>(false);
  const [newCropName, setNewCropName] = useState<string>('');
  const [newCropMsp, setNewCropMsp] = useState<number>(2400);
  const [newCropSeason, setNewCropSeason] = useState<string>('Kharif 2026');

  const [showAddCentreModal, setShowAddCentreModal] = useState<boolean>(false);
  const [newCentreName, setNewCentreName] = useState<string>('');
  const [newCentreLocation, setNewCentreLocation] = useState<string>('');
  const [newCentreCapacity, setNewCentreCapacity] = useState<number>(1500);

  // Data Collections
  const [operatorsList, setOperatorsList] = useState<any[]>([
    { id: 'APMC-54031', name: 'Sai Kumar', email: 'saikumar448470@gmail.com', centre: 'AMC Guntur (#402)', verified: 'Verified', status: 'Approved' },
    { id: 'APMC-0342', name: 'Pavan Surya', email: 'pavansurya9902@gmail.com', centre: 'AMC Tenali (#108)', verified: 'Verified', status: 'Approved' },
    { id: 'OP-103', name: 'R. K. Verma', email: 'operator.guntur@apmc.gov.in', centre: 'Godavari Mandi (#201)', verified: 'Unverified', status: 'Pending Approval' },
    { id: 'OP-102', name: 'M. Sridhar', email: 'operator.tenali@apmc.gov.in', centre: 'AMC Tenali (#108)', verified: 'Verified', status: 'Approved' },
    { id: 'OP-101', name: 'V. Naidu', email: 'operator.vizianagaram@apmc.gov.in', centre: 'Vizianagaram (#012)', verified: 'Unverified', status: 'Pending Approval' }
  ]);

  const [centresList, setCentresList] = useState<any[]>([
    { id: 'CTR-402', name: 'AMC Guntur Central', district: 'Guntur, AP', dailyQuota: 1200, activeWeighbridges: 3, operators: 4, status: 'Active' },
    { id: 'CTR-108', name: 'AMC Tenali Mandi', district: 'Guntur, AP', dailyQuota: 800, activeWeighbridges: 2, operators: 3, status: 'Active' },
    { id: 'CTR-201', name: 'Godavari Agricultural Market', district: 'East Godavari, AP', dailyQuota: 2000, activeWeighbridges: 5, operators: 6, status: 'Active' },
    { id: 'CTR-012', name: 'Vizianagaram Regulated Market', district: 'Vizianagaram, AP', dailyQuota: 1000, activeWeighbridges: 2, operators: 2, status: 'Active' }
  ]);

  const [cropsList, setCropsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('smartfarmer_crop_rates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'CR-PADDY-GRADE-A', name: 'Paddy (Grade A)', msp: 2300, marketPrice: 2380, season: 'Kharif 2026', totalProcured: 1450, moistureLimit: '≤ 17.0%', lastUpdated: 'Just Now' },
      { id: 'CR-PADDY-COMMON', name: 'Paddy (Common)', msp: 2183, marketPrice: 2240, season: 'Kharif 2026', totalProcured: 920, moistureLimit: '≤ 17.0%', lastUpdated: 'Just Now' },
      { id: 'CR-COTTON', name: 'Cotton (Medium Staple)', msp: 6620, marketPrice: 6750, season: 'Kharif 2026', totalProcured: 480, moistureLimit: '≤ 12.0%', lastUpdated: 'Just Now' },
      { id: 'CR-WHEAT', name: 'Wheat (Sharbati)', msp: 2275, marketPrice: 2340, season: 'Rabi 2026', totalProcured: 610, moistureLimit: '≤ 14.0%', lastUpdated: 'Just Now' },
      { id: 'CR-MAIZE', name: 'Maize (Kharif)', msp: 2090, marketPrice: 2150, season: 'Kharif 2026', totalProcured: 350, moistureLimit: '≤ 14.5%', lastUpdated: 'Just Now' }
    ];
  });

  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [editMsp, setEditMsp] = useState<number>(2300);
  const [editMarketPrice, setEditMarketPrice] = useState<number>(2380);

  const [farmersList] = useState<any[]>([
    { id: 'FR-AP-2026-000124', name: 'Prudhvi Pavan', mobile: '+91 9125421544', state: 'Andhra Pradesh', aadhaar: 'Verified', bank: 'SBI (A/C: ****5512)', totalSold: 125, dbtPaid: '₹2,87,500' },
    { id: 'FMR-20', name: 'V. Srinivasa Rao', mobile: '+91 9848012345', state: 'Andhra Pradesh', aadhaar: 'Verified', bank: 'Andhra Bank (A/C: ****9012)', totalSold: 210, dbtPaid: '₹13,90,200' },
    { id: 'FMR-21', name: 'K. Ramesh', mobile: '+91 9440156789', state: 'Andhra Pradesh', aadhaar: 'Verified', bank: 'HDFC (A/C: ****3321)', totalSold: 95, dbtPaid: '₹2,07,385' },
    { id: 'FMR-22', name: 'B. Satyanarayana', mobile: '+91 9989023456', state: 'Andhra Pradesh', aadhaar: 'Verified', bank: 'SBI (A/C: ****1188)', totalSold: 150, dbtPaid: '₹3,41,250' }
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'AUD-903', action: 'DBT_PAYMENT_DISBURSED', user: 'DoCA Gateway', details: '₹1,84,000 transferred to Farmer M. Venkata Reddy for Token PDC-110294', time: '5 mins ago' },
    { id: 'AUD-902', action: 'WEIGHBRIDGE_RECORDED', user: 'Operator APMC-54031', details: 'Net Weight: 45.00 Qtl recorded at Centre #402', time: '12 mins ago' },
    { id: 'AUD-901', action: 'SLOT_RESCHEDULED', user: 'Farmer FMR-19', details: 'Rescheduled slot to 02 Sep (Reason: Heavy Rain)', time: '28 mins ago' },
    { id: 'AUD-900', action: 'GATE_ENTRY_CHECKIN', user: 'Operator APMC-54031', details: 'Scanned digital QR Gate Pass for Token PDC-774321', time: '45 mins ago' },
    { id: 'AUD-899', action: 'OPERATOR_APPROVED', user: 'Admin SA-01', details: 'Approved credentials for Operator Sai Kumar (APMC-54031)', time: '2 hours ago' }
  ]);

  const handleLoginSubmit = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setIsAuthenticated(true);
    }, 400);
  };

  const handleToggleOperatorStatus = (id: string) => {
    setOperatorsList(
      operatorsList.map((op) => {
        if (op.id === id) {
          const nextStatus = op.status === 'Approved' ? 'Pending Approval' : 'Approved';
          return { ...op, status: nextStatus };
        }
        return op;
      })
    );
  };

  const handleOpenEditCrop = (crop: any) => {
    setEditingCrop(crop);
    setEditMsp(crop.msp);
    setEditMarketPrice(crop.marketPrice || crop.msp + 80);
  };

  const handleSaveCropPrice = () => {
    if (!editingCrop) return;
    const updated = cropsList.map((c) => {
      if (c.id === editingCrop.id) {
        return {
          ...c,
          msp: Number(editMsp),
          marketPrice: Number(editMarketPrice),
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return c;
    });
    setCropsList(updated);
    localStorage.setItem('smartfarmer_crop_rates', JSON.stringify(updated));
    setEditingCrop(null);
    alert(`Market rate for ${editingCrop.name} updated to MSP ₹${editMsp}/Qtl & Market Price ₹${editMarketPrice}/Qtl across all Farmer apps!`);
  };

  const handleAddCrop = () => {
    if (!newCropName.trim()) {
      alert('Please enter crop name.');
      return;
    }
    const newCrop = {
      id: `CR-${newCropName.toUpperCase().replace(/\s+/g, '-')}`,
      name: newCropName,
      msp: Number(newCropMsp),
      marketPrice: Number(newCropMsp) + 80,
      season: newCropSeason,
      totalProcured: 0,
      moistureLimit: '≤ 15.0%',
      lastUpdated: 'Just Now'
    };
    const updated = [...cropsList, newCrop];
    setCropsList(updated);
    localStorage.setItem('smartfarmer_crop_rates', JSON.stringify(updated));
    setNewCropName('');
    setShowAddCropModal(false);
    alert(`Crop ${newCrop.name} with MSP ₹${newCrop.msp}/Qtl published successfully to all APMC Centres.`);
  };

  const handleAddCentre = () => {
    if (!newCentreName.trim()) {
      alert('Please enter centre name.');
      return;
    }
    const newC = {
      id: `CTR-${Math.floor(100 + Math.random() * 900)}`,
      name: newCentreName,
      district: newCentreLocation || 'Andhra Pradesh',
      dailyQuota: Number(newCentreCapacity),
      activeWeighbridges: 2,
      operators: 2,
      status: 'Active'
    };
    setCentresList([...centresList, newC]);
    setNewCentreName('');
    setShowAddCentreModal(false);
    alert(`New APMC Mandi Centre ${newC.name} registered and activated.`);
  };

  // =============================================================
  // RENDER RBAC AUTH (EXACT SCREENSHOT REPLICA)
  // =============================================================
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FarmSolLogo size="md" showTagline={true} />
            <div className="auth-badge" style={{ marginTop: 14 }}>
              NATIONAL AGRICULTURAL ACCESS PORTAL
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.35rem', marginTop: 4 }}>Smart Procure</h1>
            <p className="auth-subtitle">From Farm to Market, Made Smarter.</p>
          </div>

          <div className="auth-main-tabs">
            <button
              className={`auth-main-tab ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => setAuthMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-main-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="role-label">SELECT YOUR ROLE / RBAC PORTAL</div>
          <div className="role-selector">
            <button className="role-btn" onClick={() => (window.location.href = window.location.origin)}>
              Farmer
            </button>
            <button className="role-btn" onClick={() => (window.location.href = window.location.origin)}>
              Operator
            </button>
            <button className="role-btn active-admin">
              Admin
            </button>
          </div>

          <div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">Administrator Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="email" className="input-box-auth" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showPassword ? 'text' : 'password'} className="input-box-auth" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                <button type="button" style={{ position: 'absolute', right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="password-strength-box">
              <div className="strength-header">
                <span style={{ color: '#64748b' }}>Password Strength:</span>
                <span style={{ color: '#16a34a' }}>VERY STRONG</span>
              </div>
              <div className="strength-bars"><div className="strength-bar-fill"></div></div>
              <div className="strength-checklist">
                <span>✓ 8+ chars</span><span>✓ Upper & lower</span><span>✓ Number (0-9)</span><span>✓ Symbol (@#$)</span>
              </div>
            </div>

            <div className="auth-notice-pill" style={{ background: '#f1f5f9' }}>
              <span style={{ color: '#273b64', fontWeight: 600 }}>256-Bit SSL Encrypted Admin Gateway</span>
            </div>

            <button className="btn-login-admin" onClick={handleLoginSubmit}>
              {authLoading ? 'Verifying...' : 'Access DoCA Admin Portal'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER ADMIN WORKSPACE (DOCA CENTRAL GOVERNANCE)
  // =============================================================
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand-header">SMART PROCURE</div>

        <div className="admin-menu-label">CENTRAL GOVERNANCE MENU</div>

        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`admin-nav-item ${activeTab === 'centres' ? 'active' : ''}`} onClick={() => setActiveTab('centres')}>APMC Centres</button>
          <button className={`admin-nav-item ${activeTab === 'operators' ? 'active' : ''}`} onClick={() => setActiveTab('operators')}>Mandi Operators</button>
          <button className={`admin-nav-item ${activeTab === 'farmers' ? 'active' : ''}`} onClick={() => setActiveTab('farmers')}>Farmers Registry</button>
          <button className={`admin-nav-item ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')}>Crops & MSP Pricing</button>
          <button className={`admin-nav-item ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>Slots & Capacity</button>
          <button className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Audit Logs</button>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>System Settings</button>
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="admin-nav-item" style={{ color: '#ef4444' }} onClick={() => { setIsAuthenticated(false); window.location.href = window.location.origin; }}>
            Sign Out & Return to Kisan App
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-wrapper">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Ministry of Consumer Affairs, Food & Public Distribution (DoCA)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>SA</div>
              System Administrator
            </div>
          </div>
        </header>

        <div className="admin-content-body">
          {/* ========================================================= */}
          {/* TAB 1: SYSTEM OVERVIEW (DASHBOARD)                        */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>National System Overview</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Real-time monitoring across all APMC Mandis, MSP Disbursements, and Congestion Indexes.
                </p>
              </div>

              {/* 5 KPI Cards */}
              <div className="admin-kpi-row">
                <div className="admin-kpi-card"><span className="admin-kpi-title">Total Registered Farmers</span><span className="admin-kpi-value">14,250</span></div>
                <div className="admin-kpi-card"><span className="admin-kpi-title">Active APMC Centres</span><span className="admin-kpi-value">{centresList.length}</span></div>
                <div className="admin-kpi-card"><span className="admin-kpi-title">Certified Operators</span><span className="admin-kpi-value">{operatorsList.length}</span></div>
                <div className="admin-kpi-card"><span className="admin-kpi-title">Total MT Procured</span><span className="admin-kpi-value">8,420 MT</span></div>
                <div className="admin-kpi-card"><span className="admin-kpi-title">DBT Disbursed</span><span className="admin-kpi-value">₹19.4 Cr</span></div>
              </div>

              {/* Charts Grid */}
              <div className="admin-charts-grid">
                {/* Bar Chart */}
                <div className="chart-box">
                  <div className="chart-title">Procurement & Capacity by Centre (Current Week)</div>
                  <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid var(--border)' }}>
                    {[
                      { centre: 'AMC Guntur', h1: 140, h2: 110 },
                      { centre: 'AMC Tenali', h1: 100, h2: 75 },
                      { centre: 'Godavari', h1: 170, h2: 150 },
                      { centre: 'Vizianagaram', h1: 90, h2: 60 }
                    ].map((b, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 150 }}>
                          <div style={{ width: 18, height: b.h1, background: '#0284c7', borderRadius: '3px 3px 0 0' }} title="Capacity Quota"></div>
                          <div style={{ width: 18, height: b.h2, background: '#22c55e', borderRadius: '3px 3px 0 0' }} title="Procured Quantity"></div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{b.centre}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, background: '#0284c7', borderRadius: 2 }}></div> Daily Quota</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: 2 }}></div> Actual Procured</div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="chart-box">
                  <div className="chart-title">National Commodity Procurement Share</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
                    <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'conic-gradient(#22c55e 0% 45%, #3b82f6 45% 65%, #f59e0b 65% 85%, #8b5cf6 85% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 68, height: 68, background: '#ffffff', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: '0.75rem', marginTop: 10 }}>
                    <div><span style={{ color: '#22c55e' }}>●</span> Paddy (45%)</div>
                    <div><span style={{ color: '#3b82f6' }}>●</span> Cotton (20%)</div>
                    <div><span style={{ color: '#f59e0b' }}>●</span> Wheat (20%)</div>
                    <div><span style={{ color: '#8b5cf6' }}>●</span> Coarse Grains (15%)</div>
                  </div>
                </div>
              </div>

              {/* Operators Table Snapshot */}
              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Mandi Operator Credentials</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Approve and manage operator access across Mandis.</p>
                  </div>
                  <button className="btn-call-next" style={{ background: '#273b64' }} onClick={() => setActiveTab('operators')}>
                    Manage All Operators
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>OPERATOR ID</th>
                      <th style={{ padding: '10px 12px' }}>NAME & EMAIL</th>
                      <th style={{ padding: '10px 12px' }}>ASSIGNED APMC MANDI</th>
                      <th style={{ padding: '10px 12px' }}>STATUS</th>
                      <th style={{ padding: '10px 12px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorsList.slice(0, 3).map((op, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 800 }}>{op.id}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700 }}>{op.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{op.email}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{op.centre}</td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              background: op.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                              color: op.status === 'Approved' ? '#15803d' : '#b45309',
                              padding: '3px 10px',
                              borderRadius: 9999,
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          >
                            {op.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            style={{
                              background: op.status === 'Approved' ? '#ffffff' : '#15803d',
                              border: op.status === 'Approved' ? '1px solid #fecaca' : 'none',
                              color: op.status === 'Approved' ? '#ef4444' : '#ffffff',
                              padding: '5px 12px',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleToggleOperatorStatus(op.id)}
                          >
                            {op.status === 'Approved' ? 'Revoke' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: APMC CENTRES MANAGEMENT                            */}
          {/* ========================================================= */}
          {activeTab === 'centres' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>APMC Procurement Centres</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage mandi capacities, electronic weighbridges, and daily intake limits.</p>
                </div>
                <button className="btn-call-next" style={{ background: 'var(--primary)' }} onClick={() => setShowAddCentreModal(true)}>
                  + Add New Mandi Centre
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {centresList.map((c) => (
                  <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c.name}</div>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>{c.id} • District: {c.district}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '0.78rem', background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                      <div><strong>Daily Quota:</strong> {c.dailyQuota} Qtl</div>
                      <div><strong>Weighbridges:</strong> {c.activeWeighbridges} Active</div>
                      <div><strong>Operators:</strong> {c.operators} Staff</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: OPERATORS MANAGEMENT                               */}
          {/* ========================================================= */}
          {activeTab === 'operators' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mandi Procurement Operators</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Authorized field personnel responsible for gate scanning, assaying, and weighbridge records.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>OPERATOR ID</th>
                    <th style={{ padding: '10px 12px' }}>NAME & EMAIL</th>
                    <th style={{ padding: '10px 12px' }}>ASSIGNED APMC MANDI</th>
                    <th style={{ padding: '10px 12px' }}>VERIFIED</th>
                    <th style={{ padding: '10px 12px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorsList.map((op, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 800 }}>{op.id}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700 }}>{op.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{op.email}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{op.centre}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{op.verified}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            background: op.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                            color: op.status === 'Approved' ? '#15803d' : '#b45309',
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          style={{
                            background: op.status === 'Approved' ? '#ffffff' : '#15803d',
                            border: op.status === 'Approved' ? '1px solid #fecaca' : 'none',
                            color: op.status === 'Approved' ? '#ef4444' : '#ffffff',
                            padding: '5px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleOperatorStatus(op.id)}
                        >
                          {op.status === 'Approved' ? 'Revoke' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FARMERS REGISTRY                                   */}
          {/* ========================================================= */}
          {activeTab === 'farmers' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>National Farmers Registry</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Central database of farmers registered with Aadhaar-verified DBT bank accounts.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>FARMER ID</th>
                    <th style={{ padding: '10px 12px' }}>NAME & MOBILE</th>
                    <th style={{ padding: '10px 12px' }}>STATE</th>
                    <th style={{ padding: '10px 12px' }}>AADHAAR & BANK</th>
                    <th style={{ padding: '10px 12px' }}>TOTAL SOLD</th>
                    <th style={{ padding: '10px 12px' }}>DBT TRANSFERRED</th>
                  </tr>
                </thead>
                <tbody>
                  {farmersList.map((f) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12, fontWeight: 800 }}>{f.id}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 700 }}>{f.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.mobile}</div>
                      </td>
                      <td style={{ padding: 12 }}>{f.state}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ color: '#16a34a', fontWeight: 700 }}>✓ Aadhaar {f.aadhaar}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.bank}</div>
                      </td>
                      <td style={{ padding: 12, fontWeight: 700 }}>{f.totalSold} Qtl</td>
                      <td style={{ padding: 12, fontWeight: 800, color: '#15803d' }}>{f.dbtPaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CROPS & MSP PRICING MASTER                         */}
          {/* ========================================================= */}
          {activeTab === 'crops' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Crop MSP & Quality Specifications</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Official Government-Guaranteed Minimum Support Prices for Season 2026.</p>
                </div>
                <button className="btn-call-next" style={{ background: 'var(--primary)' }} onClick={() => setShowAddCropModal(true)}>
                  + Add / Update MSP Crop
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: 10 }}>COMMODITY</th>
                    <th style={{ padding: 10 }}>SEASON</th>
                    <th style={{ padding: 10 }}>GOVT MSP RATE</th>
                    <th style={{ padding: 10 }}>MARKET PRICE</th>
                    <th style={{ padding: 10 }}>MOISTURE SPEC</th>
                    <th style={{ padding: 10 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cropsList.map((crop) => (
                    <tr key={crop.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12, fontWeight: 700 }}>
                        {crop.name}
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>ID: {crop.id}</div>
                      </td>
                      <td style={{ padding: 12 }}>{crop.season}</td>
                      <td style={{ padding: 12, fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>₹{crop.msp} / Qtl</td>
                      <td style={{ padding: 12, fontWeight: 800, color: '#2563eb', fontSize: '0.95rem' }}>₹{crop.marketPrice || crop.msp + 80} / Qtl</td>
                      <td style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>{crop.moistureLimit}</td>
                      <td style={{ padding: 12 }}>
                        <button
                          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '5px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                          onClick={() => handleOpenEditCrop(crop)}
                        >
                          Edit Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Edit Crop Rate Modal */}
              {editingCrop && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div style={{ background: '#ffffff', borderRadius: 16, width: 420, padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Update Crop Market Price</h3>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => setEditingCrop(null)}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
                      Updating prices here will dynamically refresh market rates on all Kisan mobile apps and Mandi operator desks.
                    </p>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>CROP NAME</label>
                      <input type="text" value={editingCrop.name} disabled style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>GOVT MSP RATE (₹/Quintal)</label>
                      <input type="number" value={editMsp} onChange={(e) => setEditMsp(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700 }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>CURRENT MARKET PRICE (₹/Quintal)</label>
                      <input type="number" value={editMarketPrice} onChange={(e) => setEditMarketPrice(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 700 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }} onClick={() => setEditingCrop(null)}>Cancel</button>
                      <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#15803d', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }} onClick={handleSaveCropPrice}>Save & Publish Live</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: SLOTS & CAPACITY                                   */}
          {/* ========================================================= */}
          {activeTab === 'slots' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>APMC Slot Allocation & Time Windows</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>Standard 2-hour arrival windows configured to prevent mandi congestion.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { time: '07:00 AM - 09:00 AM', quota: '25 Farmers', status: 'Morning Peak' },
                  { time: '09:00 AM - 11:00 AM', quota: '30 Farmers', status: 'Optimal' },
                  { time: '11:00 AM - 01:00 PM', quota: '35 Farmers', status: 'High Traffic' },
                  { time: '02:00 PM - 04:00 PM', quota: '20 Farmers', status: 'Afternoon' }
                ].map((s, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: '#f8fafc' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>{s.time}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Capacity: {s.quota}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Buffer: 15 mins</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: AUDIT LOGS                                         */}
          {/* ========================================================= */}
          {activeTab === 'audit' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Immutable System Audit Logs</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cryptographically stamped events tracking all gate check-ins, assays, weighing, and DBT credits.</p>
                </div>
                <button className="btn-scan-qr" onClick={() => alert('Exporting full audit trail to CSV...')}>
                  Export Audit Log
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {auditLogs.map((l) => (
                  <div key={l.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{l.action}</span>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}>{l.id}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{l.details}</div>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Actor: {l.user}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{l.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: SETTINGS                                           */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 640 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>DoCA National System Parameters</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>Direct Benefit Transfer (DBT) endpoints, SMS Gateway, and Security Settings.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label-auth">DBT Payment Gateway API Endpoint</label>
                  <input type="text" className="input-box-auth" defaultValue="https://dbt.gov.in/api/v2/disburse" />
                </div>
                <div>
                  <label className="form-label-auth">SMS / WhatsApp Gateway Provider</label>
                  <input type="text" className="input-box-auth" defaultValue="NIC-Govt-SMS-Gateway-PROD" />
                </div>
                <div>
                  <label className="form-label-auth">Automatic Cancellation Buffer Time</label>
                  <input type="text" className="input-box-auth" defaultValue="120 Minutes after Slot Window" />
                </div>
                <button className="btn-login-admin" onClick={() => alert('DoCA System parameters updated.')}>
                  Save System Parameters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / UPDATE CROP MSP                              */}
      {/* ========================================================= */}
      {showAddCropModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Add / Update Crop MSP Rate</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Crop Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="input-box-auth" placeholder="e.g. Soya Bean, Mustard" value={newCropName} onChange={(e) => setNewCropName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Government MSP Rate (₹/Quintal) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" className="input-box-auth" value={newCropMsp} onChange={(e) => setNewCropMsp(Number(e.target.value))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-auth">Season</label>
              <select className="input-box-auth" value={newCropSeason} onChange={(e) => setNewCropSeason(e.target.value)}>
                <option value="Kharif 2026">Kharif 2026</option>
                <option value="Rabi 2026">Rabi 2026</option>
                <option value="Zaid 2026">Zaid 2026</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-scan-qr" style={{ flex: 1 }} onClick={() => setShowAddCropModal(false)}>Cancel</button>
              <button className="btn-call-next" style={{ flex: 1, background: 'var(--primary)' }} onClick={handleAddCrop}>Publish MSP</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW MANDI CENTRE                               */}
      {/* ========================================================= */}
      {showAddCentreModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Register New APMC Mandi Centre</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Centre Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="input-box-auth" placeholder="e.g. AMC Ongole Market Yard" value={newCentreName} onChange={(e) => setNewCentreName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">District & State <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="input-box-auth" placeholder="e.g. Prakasam, Andhra Pradesh" value={newCentreLocation} onChange={(e) => setNewCentreLocation(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-auth">Daily Intake Quota (Quintals)</label>
              <input type="number" className="input-box-auth" value={newCentreCapacity} onChange={(e) => setNewCentreCapacity(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-scan-qr" style={{ flex: 1 }} onClick={() => setShowAddCentreModal(false)}>Cancel</button>
              <button className="btn-call-next" style={{ flex: 1, background: 'var(--primary)' }} onClick={handleAddCentre}>Activate Centre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
