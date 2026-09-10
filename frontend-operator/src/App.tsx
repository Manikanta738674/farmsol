import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FarmSolLogo } from './components/FarmSolLogo';
import { io } from 'socket.io-client';
import { realtimeSync } from './utils/realtimeSync';
import { persistentRepo } from './utils/persistentRepo';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  // Auth & RBAC State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true') return true;
      if (params.get('logout') === 'true') return false;
      return !!persistentRepo.getOperator();
    }
    return false;
  });
  const [userRole, setUserRole] = useState<'farmer' | 'operator' | 'admin'>('operator');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Form Fields matching user's screenshot
  const [emailInput, setEmailInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('email')) return params.get('email') || 'saikumar448470@gmail.com';
      const op = persistentRepo.getOperator();
      if (op && op.email) return op.email;
    }
    return 'saikumar448470@gmail.com';
  });
  const [passwordInput, setPasswordInput] = useState<string>('Pavan@2026Secure!');
  const [farmerMobile, setFarmerMobile] = useState<string>('9125421544');

  // Operator-to-Centre Registry Dictionary (Multi-Mandi Assignment)
  const OPERATOR_REGISTRY: Record<string, { id: string; name: string; centreId: string; centreName: string; location: string; counters: number }> = {
    'saikumar448470@gmail.com': { id: 'APMC-54031', name: 'Sai Kumar', centreId: 'CTR-402', centreName: 'AMC Guntur Central (#402)', location: 'Guntur, AP', counters: 3 },
    'pavansurya9902@gmail.com': { id: 'APMC-0342', name: 'Pavan Surya', centreId: 'CTR-108', centreName: 'AMC Tenali Mandi (#108)', location: 'Tenali, Guntur, AP', counters: 2 },
    'pardhupavan459@gmail.com': { id: 'OP-104', name: 'Prudhvi Pavan', centreId: 'CTR-402', centreName: 'Sri Lakshmi Procurement Centre (#402)', location: 'East Godavari, AP', counters: 4 },
    'operator.guntur@apmc.gov.in': { id: 'OP-103', name: 'R. K. Verma', centreId: 'CTR-201', centreName: 'Godavari Agricultural Mandi (#201)', location: 'East Godavari, AP', counters: 5 },
    'operator.vizianagaram@apmc.gov.in': { id: 'OP-101', name: 'V. Naidu', centreId: 'CTR-012', centreName: 'Vizianagaram Regulated Market (#012)', location: 'Vizianagaram, AP', counters: 2 }
  };

  // Dynamic Matched Operator & Centre Profile
  const currentOperator = OPERATOR_REGISTRY[emailInput.toLowerCase().trim()] || {
    id: 'OP-104',
    name: emailInput.split('@')[0] || 'Operator',
    centreId: 'CTR-402',
    centreName: 'Sri Lakshmi Procurement Centre (#402)',
    location: 'East Godavari, AP',
    counters: 4
  };

  // Print Slip Modal State
  const [showPrintSlipModal, setShowPrintSlipModal] = useState<boolean>(false);
  const [selectedPrintSlipData, setSelectedPrintSlipData] = useState<any>(null);

  // Operator Tabs & Filter
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Current Serving & Live Queue State
  const [currentServing, setCurrentServing] = useState<any>(() => {
    const saved = persistentRepo.getServing();
    if (saved) return saved;
    return {
      tokenId: 'PDC-774321',
      farmerName: 'Prudhvi',
      farmerPhone: '+91 9125421544',
      crop: 'Paddy (Grade A)',
      quantityQuintals: 45,
      stage: 'QUALITY',
      arrivedAt: '09:05 AM',
      vehicleNo: 'AP-39-TX-8819',
      mspRate: 2300,
      moisture: 14.2,
      foreignMatter: 1.1,
      grossWeight: 7250,
      tareWeight: 2750
    };
  });

  const [queueList, setQueueList] = useState<any[]>(() => {
    const saved = persistentRepo.getQueue();
    if (saved && saved.length > 0) return saved;
    return [
      {
        tokenId: 'PDC-774321',
        farmerName: 'Prudhvi',
        farmerPhone: '+91 9125421544',
        crop: 'Paddy (Grade A)',
        quantityQuintals: 45,
        slot: '09:00 AM - 11:00 AM',
        vehicleNo: 'AP-39-TX-8819',
        status: 'PROCESSING',
        stage: 'QUALITY',
        arrivedAt: '09:05 AM',
        mspRate: 2300
      },
      {
        tokenId: 'PDC-F51B1E',
        farmerName: 'V. Srinivasa Rao',
        farmerPhone: '+91 9848012345',
        crop: 'Cotton (Medium Staple)',
        quantityQuintals: 70,
        slot: '09:00 AM - 11:00 AM',
        vehicleNo: 'AP-35-K-4921',
        status: 'WAITING',
        stage: 'WAITING',
        arrivedAt: '09:22 AM',
        mspRate: 6620
      },
      {
        tokenId: 'PDC-384591',
        farmerName: 'K. Ramesh',
        farmerPhone: '+91 9440156789',
        crop: 'Paddy (Common)',
        quantityQuintals: 50,
        slot: '11:00 AM - 01:00 PM',
        vehicleNo: 'AP-31-TR-9002',
        status: 'ARRIVED',
        stage: 'GATE_ENTRY',
        arrivedAt: '10:45 AM',
        mspRate: 2183
      },
      {
        tokenId: 'PDC-992014',
        farmerName: 'B. Satyanarayana',
        farmerPhone: '+91 9989023456',
        crop: 'Wheat (Sharbati)',
        quantityQuintals: 60,
        slot: '11:00 AM - 01:00 PM',
        vehicleNo: 'AP-39-AB-1122',
        status: 'BOOKED',
        stage: 'BOOKED',
        arrivedAt: '-',
        mspRate: 2275
      },
      {
        tokenId: 'PDC-110294',
        farmerName: 'M. Venkata Reddy',
        farmerPhone: '+91 9700145678',
        crop: 'Paddy (Grade A)',
        quantityQuintals: 80,
        slot: '07:00 AM - 09:00 AM',
        vehicleNo: 'AP-39-CC-4455',
        status: 'COMPLETED',
        stage: 'COMPLETED',
        arrivedAt: '07:15 AM',
        mspRate: 2300
      }
    ];
  });

  // Modals & Forms
  const [showGateScanModal, setShowGateScanModal] = useState<boolean>(false);
  const [scanInputToken, setScanInputToken] = useState<string>('PDC-384591');
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [moisture, setMoisture] = useState<number>(14.2);
  const [foreignMatter, setForeignMatter] = useState<number>(1.1);
  const [qualityGrade, setQualityGrade] = useState<string>('GRADE_A');
  const [showWeighingModal, setShowWeighingModal] = useState<boolean>(false);
  const [grossWeight, setGrossWeight] = useState<number>(7250);
  const [tareWeight, setTareWeight] = useState<number>(2750);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [completedCertData, setCompletedCertData] = useState<any>(null);

  // Farmers Directory Data
  const [farmersList] = useState<any[]>([
    { id: 'FMR-19', name: 'Prudhvi', phone: '+91 9125421544', village: 'Guntur Rural', aadhaar: 'XXXX-XXXX-8821', bank: 'SBI (A/C: ****5512)', totalSold: 125, dbtReceived: 287500 },
    { id: 'FMR-20', name: 'V. Srinivasa Rao', phone: '+91 9848012345', village: 'Tenali', aadhaar: 'XXXX-XXXX-1930', bank: 'Andhra Bank (A/C: ****9012)', totalSold: 210, dbtReceived: 1390200 },
    { id: 'FMR-21', name: 'K. Ramesh', phone: '+91 9440156789', village: 'Bapatla', aadhaar: 'XXXX-XXXX-4421', bank: 'HDFC Bank (A/C: ****3321)', totalSold: 95, dbtReceived: 207385 },
    { id: 'FMR-22', name: 'B. Satyanarayana', phone: '+91 9989023456', village: 'Mangalagiri', aadhaar: 'XXXX-XXXX-7711', bank: 'SBI (A/C: ****1188)', totalSold: 150, dbtReceived: 341250 }
  ]);

  // Payments Ledger Data
  const [paymentsLedger, setPaymentsLedger] = useState<any[]>(() => {
    const saved = persistentRepo.getPaymentsLedger();
    if (saved && saved.length > 0) return saved;
    return [
      { id: 'DBT-2026-9041', tokenId: 'PDC-110294', farmer: 'M. Venkata Reddy', crop: 'Paddy (Grade A)', weight: 80, msp: 2300, amount: 184000, bank: 'SBI A/C ****9901', utr: 'SBIN002948102', status: 'SUCCESS', date: '01 Sep 2026' },
      { id: 'DBT-2026-9038', tokenId: 'PDC-009182', farmer: 'G. Apparao', crop: 'Cotton (Medium Staple)', weight: 65, msp: 6620, amount: 430300, bank: 'Union Bank A/C ****4412', utr: 'UBIN004810293', status: 'SUCCESS', date: '31 Aug 2026' },
      { id: 'DBT-2026-9035', tokenId: 'PDC-881920', farmer: 'P. Krishna Murthy', crop: 'Paddy (Common)', weight: 110, msp: 2183, amount: 240130, bank: 'SBI A/C ****7732', utr: 'SBIN001928471', status: 'SUCCESS', date: '31 Aug 2026' }
    ];
  });

  // Payment Settlement Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStatusChoice, setPaymentStatusChoice] = useState<'COMPLETED' | 'PENDING'>('COMPLETED');
  const [paymentUtrInput, setPaymentUtrInput] = useState<string>(`UTR-20260902-${Math.floor(10000 + Math.random() * 90000)}`);
  const [paymentNotes, setPaymentNotes] = useState<string>('Standard MSP Direct Benefit Transfer verified and cleared by Mandi Officer.');
  const [isSettlingPayment, setIsSettlingPayment] = useState<boolean>(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    realtimeSync.setPortal('operator');
    const unsubQueue = realtimeSync.subscribe('queue:update', (data: any) => {
      if (data && data.tokenId) {
        setQueueList((prev) =>
          prev.map((q) => (q.tokenId === data.tokenId ? { ...q, stage: data.currentStage || q.stage, status: data.status || q.status } : q))
        );
      }
    });

    const unsubBooking = realtimeSync.subscribe('booking:created', (data: any) => {
      if (data && data.tokenId) {
        setQueueList((prev) => [
          {
            tokenId: data.tokenId,
            farmerName: data.farmerName || 'Registered Farmer',
            farmerPhone: data.farmerPhone || '+91 9125421544',
            crop: data.cropName || 'Paddy (Grade A)',
            quantityQuintals: data.expectedQuantityQuintals || 45,
            slot: data.timeWindow || '09:00 AM - 11:00 AM',
            vehicleNo: 'AP-39-TX-8819',
            status: 'WAITING',
            stage: 'WAITING',
            arrivedAt: 'Just Now',
            mspRate: data.mspRate || 2300
          },
          ...prev
        ]);
      }
    });

    let s: any = null;
    try {
      s = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      s.on('connect', () => {
        s.emit('join:operator', currentOperator.id);
        s.emit('join:centre', currentOperator.centreId);
      });
      setSocket(s);
    } catch (e) {
      console.warn('Socket connect error in operator:', e);
    }
    return () => {
      unsubQueue();
      unsubBooking();
      if (s) s.disconnect();
    };
  }, [currentOperator.id, currentOperator.centreId]);

  // Synchronize state with persistent repo
  useEffect(() => {
    if (queueList && queueList.length > 0) {
      persistentRepo.saveQueue(queueList);
    }
  }, [queueList]);

  useEffect(() => {
    persistentRepo.saveServing(currentServing);
  }, [currentServing]);

  useEffect(() => {
    if (paymentsLedger && paymentsLedger.length > 0) {
      persistentRepo.savePaymentsLedger(paymentsLedger);
    }
  }, [paymentsLedger]);

  const handleLoginSubmit = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setIsAuthenticated(true);
      persistentRepo.saveOperator(currentOperator);
    }, 400);
  };

  const handleCallNextFarmer = () => {
    const nextWaiting = queueList.find(q => q.status === 'WAITING' || q.status === 'ARRIVED');
    if (nextWaiting) {
      setCurrentServing({
        ...nextWaiting,
        stage: 'QUALITY',
        grossWeight: 7250,
        tareWeight: 2750,
        moisture: 14.5,
        foreignMatter: 1.0
      });
      setQueueList(queueList.map(q => q.tokenId === nextWaiting.tokenId ? { ...q, status: 'PROCESSING', stage: 'QUALITY' } : q));
      realtimeSync.broadcast('queue:update', {
        tokenId: nextWaiting.tokenId,
        farmerName: nextWaiting.farmerName,
        currentStage: 'QUALITY',
        status: 'PROCESSING'
      });
      alert(`Calling Token #${nextWaiting.tokenId} (${nextWaiting.farmerName}) to Quality Inspection Desk.`);
    } else {
      alert('No waiting farmers in the queue currently.');
    }
  };

  const handleGateScanSubmit = () => {
    const found = queueList.find(q => q.tokenId === scanInputToken.trim().toUpperCase());
    const token = found ? found.tokenId : scanInputToken.trim().toUpperCase();
    if (found) {
      setQueueList(queueList.map(q => q.tokenId === found.tokenId ? { ...q, status: 'WAITING', stage: 'WAITING', arrivedAt: 'Just Now' } : q));
      alert(`Gate Entry Verified! Token #${found.tokenId} for ${found.farmerName} admitted to Mandi.`);
    } else {
      alert(`Gate Pass Token #${scanInputToken} verified and registered at APMC Centre #402.`);
    }
    realtimeSync.broadcast('gate:arrival', { tokenId: token, status: 'WAITING', stage: 'WAITING' });
    realtimeSync.broadcast('queue:update', { tokenId: token, currentStage: 'WAITING', status: 'WAITING' });
    setShowGateScanModal(false);
  };

  const handleSaveQualityAssay = () => {
    if (moisture > 17.0) {
      alert(`Warning: Moisture is ${moisture}%, which exceeds DoCA standard of 17.0% for Paddy Grade A. Dockage or drying required.`);
      return;
    }
    if (currentServing) {
      setCurrentServing({ ...currentServing, stage: 'WEIGHING', moisture, foreignMatter, qualityGrade });
      setQueueList(queueList.map(q => q.tokenId === currentServing.tokenId ? { ...q, stage: 'WEIGHING' } : q));
      realtimeSync.broadcast('queue:update', {
        tokenId: currentServing.tokenId,
        currentStage: 'WEIGHING',
        moisture,
        foreignMatter,
        qualityGrade
      });
    }
    setShowQualityModal(false);
    alert(`Quality Assay Passed: Moisture ${moisture}% (Govt Limit ≤ 17.0%). Produce forwarded to Weighbridge.`);
  };

  const handleConfirmWeighing = () => {
    const liveNetKg = Math.max(0, grossWeight - tareWeight);
    const liveNetQtl = Number((liveNetKg / 100).toFixed(2));
    const liveMoisture = currentServing?.moisture || moisture || 14.0;
    const liveExcessMoisture = Math.max(0, liveMoisture - 14.0);
    const liveDockageKg = liveExcessMoisture > 0 ? Number((liveNetKg * (liveExcessMoisture * 0.005)).toFixed(1)) : 0;
    const liveDockageQtl = Number((liveDockageKg / 100).toFixed(2));
    const finalQuintals = Number(Math.max(0, liveNetQtl - liveDockageQtl).toFixed(2));
    const mspRate = currentServing?.mspRate || 2300;
    const payout = Math.round(finalQuintals * mspRate);

    if (currentServing) {
      const updatedServing = {
        ...currentServing,
        stage: 'COMPLETED',
        grossWeight,
        tareWeight,
        netWeight: liveNetKg,
        netQuintals: finalQuintals,
        dockageKg: liveDockageKg,
        calculatedPayout: payout
      };
      setCurrentServing(updatedServing);
      persistentRepo.saveServing(updatedServing);

      const updatedQueue = queueList.map(q =>
        q.tokenId === currentServing.tokenId
          ? { ...q, stage: 'COMPLETED', status: 'COMPLETED', quantityQuintals: finalQuintals, calculatedPayout: payout }
          : q
      );
      setQueueList(updatedQueue);
      persistentRepo.saveQueue(updatedQueue);

      realtimeSync.broadcast('queue:update', {
        tokenId: currentServing.tokenId,
        currentStage: 'COMPLETED',
        grossWeight,
        tareWeight,
        netQuintals: finalQuintals,
        dockageKg: liveDockageKg,
        calculatedPayout: payout
      });
    }
    setShowWeighingModal(false);
    alert(`Weighbridge Confirmed:\n• Gross: ${grossWeight} kg\n• Tare: ${tareWeight} kg\n• Net Produce: ${liveNetQtl} Qtl\n• Moisture Dockage: -${liveDockageKg} kg (${liveDockageQtl} Qtl)\n• Final Billable: ${finalQuintals} Qtl @ ₹${mspRate}/Qtl = ₹${payout.toLocaleString('en-IN')}`);
  };

  const handleCompleteProcurement = () => {
    if (!currentServing) return;
    setPaymentStatusChoice('COMPLETED');
    setPaymentUtrInput(`UTR-20260902-${Math.floor(10000 + Math.random() * 90000)}`);
    setShowPaymentModal(true);
  };

  const handleSettlePayment = async () => {
    if (!currentServing) return;
    setIsSettlingPayment(true);
    const netQtl = currentServing.netQuintals || ((currentServing.grossWeight - currentServing.tareWeight) / 100) || currentServing.quantityQuintals;
    const payout = netQtl * currentServing.mspRate;
    const isCompleted = paymentStatusChoice === 'COMPLETED';

    const payload = {
      bookingId: currentServing.bookingId || 'BK-2026-000845',
      tokenId: currentServing.tokenId,
      farmerId: currentServing.farmerId || 'FR-AP-2026-000124',
      farmerName: currentServing.farmerName || 'Prudhvi Pavan',
      amount: payout,
      status: paymentStatusChoice,
      utr: paymentUtrInput,
      paymentMode: 'Direct Benefit Transfer (DBT)',
      centreId: currentOperator.centreId,
      centreName: currentOperator.centreName,
      operatorId: currentOperator.id,
      notes: paymentNotes,
      crop: currentServing.crop,
      quantityQuintals: netQtl
    };

    const teluguSms = isCompleted
      ? `డియర్ ${payload.farmerName}, మీ టోకెన్ #${payload.tokenId} కు గాను ₹${payload.amount.toLocaleString('en-IN')} మొత్తం DBT ద్వారా మీ బ్యాంక్ ఖాతాలో జమ చేయబడింది. UTR: ${payload.utr}. - వినియోగదారుల వ్యవహారాల మంత్రిత్వ శాఖ (భారత ప్రభుత్వం)`
      : `డియర్ ${payload.farmerName}, మీ టోకెన్ #${payload.tokenId} కు గాను ₹${payload.amount.toLocaleString('en-IN')} చెల్లింపు 'బాకీ (Pending)' గా నమోదు చేయబడింది. ధృవీకరణ పూర్తయ్యాక జమ చేయబడుతుంది. - భారత ప్రభుత్వం`;

    // Emit via RealtimeSync dual-layer bus (cross-tab broadcast + socket)
    realtimeSync.broadcast('payment:update', payload);
    realtimeSync.broadcast('sms:notification', {
      farmerId: payload.farmerId,
      sender: 'VD-FARMSOL',
      message: teluguSms,
      type: 'PAYMENT',
      status: payload.status,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });

    // Also emit live WebSocket event directly
    if (socket) {
      socket.emit('payment:update', payload);
      socket.emit('sms:notification', {
        farmerId: payload.farmerId,
        sender: 'VD-FARMSOL',
        message: teluguSms,
        type: 'PAYMENT',
        status: payload.status,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }

    // Try sending to backend API
    try {
      await fetch(`${API_BASE}/operator/payment/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Backend payment settle call failed, proceeding with local & socket state:', e);
    }

    setIsSettlingPayment(false);
    setShowPaymentModal(false);

    // Update queue list
    setQueueList((prev) =>
      prev.map((q) =>
        q.tokenId === currentServing.tokenId
          ? {
              ...q,
              stage: 'COMPLETED',
              status: 'COMPLETED',
              paymentStatus: paymentStatusChoice,
              paymentAmount: payout,
              utr: paymentUtrInput
            }
          : q
      )
    );

    // Update payments ledger
    setPaymentsLedger((prev) => [
      {
        id: `DBT-${Date.now().toString().slice(-6)}`,
        tokenId: currentServing.tokenId,
        farmer: currentServing.farmerName,
        crop: currentServing.crop,
        weight: netQtl,
        msp: currentServing.mspRate,
        amount: payout,
        bank: 'SBI A/C ****5512',
        utr: paymentUtrInput,
        status: isCompleted ? 'SUCCESS' : 'PENDING',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      ...prev
    ]);

    if (isCompleted) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    const cert = {
      certNo: `DOCA-PROC-${Math.floor(100000 + Math.random() * 900000)}`,
      tokenId: currentServing.tokenId,
      farmerName: currentServing.farmerName || 'Prudhvi Pavan',
      farmerId: currentServing.farmerId || 'FR-AP-2026-000124',
      farmerPhone: currentServing.farmerPhone || '+91 9125421544',
      crop: currentServing.crop,
      netQuintals: netQtl,
      grossWeight: currentServing.grossWeight || 7250,
      tareWeight: currentServing.tareWeight || 2750,
      moisture: currentServing.moisture || 14.2,
      mspRate: currentServing.mspRate,
      totalPayout: payout,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      centre: currentOperator.centreName,
      location: currentOperator.location,
      operatorName: currentOperator.name,
      operatorId: currentOperator.id,
      bankAccount: 'State Bank of India (A/C: ****5512)',
      utrRef: paymentUtrInput,
      dbtStatus: isCompleted
        ? '[SUCCESS] DIRECT BENEFIT TRANSFER (DBT) EXECUTED'
        : '[PENDING] PAYMENT PENDING MANDI CLEARANCE'
    };
    setSelectedPrintSlipData(cert);
    setCompletedCertData(cert);
    setShowCertModal(true);
    setCurrentServing(null);

    alert(
      isCompleted
        ? `Payment of ₹${payout.toLocaleString('en-IN')} marked COMPLETED for Token #${payload.tokenId}. Real-time SMS dispatched to farmer!`
        : `Payment of ₹${payout.toLocaleString('en-IN')} marked PENDING for Token #${payload.tokenId}. Status SMS dispatched to farmer.`
    );
  };

  const handleOpenPrintSlip = (item: any) => {
    const netQtl = item.netQuintals || item.quantityQuintals || 45.0;
    const rate = item.mspRate || 2300;
    const payout = netQtl * rate;
    const slip = {
      certNo: `DOCA-PROC-${Math.floor(100000 + Math.random() * 900000)}`,
      tokenId: item.tokenId,
      farmerName: item.farmerName || 'Prudhvi Pavan',
      farmerId: 'FR-AP-2026-000124',
      farmerPhone: item.farmerPhone || '+91 9125421544',
      crop: item.crop || 'Paddy (Grade A)',
      netQuintals: netQtl,
      grossWeight: item.grossWeight || 7250,
      tareWeight: item.tareWeight || 2750,
      moisture: item.moisture || 14.2,
      mspRate: rate,
      totalPayout: payout,
      date: item.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      centre: currentOperator.centreName,
      location: currentOperator.location,
      operatorName: currentOperator.name,
      operatorId: currentOperator.id,
      bankAccount: 'State Bank of India (A/C: ****5512)',
      utrRef: 'UTR-20260902-88192',
      dbtStatus: '✓ DIRECT BENEFIT TRANSFER (DBT) EXECUTED'
    };
    setSelectedPrintSlipData(slip);
    setShowPrintSlipModal(true);
  };

  // Filtered Queue
  const filteredQueue = queueList.filter(item => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Arrived' && (item.status === 'ARRIVED' || item.status === 'WAITING')) ||
      (activeFilter === 'Waiting' && item.status === 'WAITING') ||
      (activeFilter === 'Processing' && item.status === 'PROCESSING') ||
      (activeFilter === 'Completed' && item.status === 'COMPLETED') ||
      (activeFilter === 'Booked' && item.status === 'BOOKED');
    const matchesSearch =
      item.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <button className="role-btn" onClick={() => (window.location.href = `http://${window.location.hostname}:3001`)}>
              Farmer
            </button>
            <button className="role-btn active-operator">
              Operator
            </button>
            <button className="role-btn" onClick={() => (window.location.href = `http://${window.location.hostname}:3020`)}>
              Admin
            </button>
          </div>

          <div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="email" className="input-box-auth" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showPassword ? 'text' : 'password'} className="input-box-auth" value={passwordInput} onChange={(e) => setShowPassword(showPassword)} />
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
                <span>8+ chars</span><span>Upper & lower</span><span>Number (0-9)</span><span>Symbol (@#$)</span>
              </div>
            </div>

            <div className="auth-notice-pill">
              <span>Procurement Operator accounts require verified APMC credentials.</span>
            </div>

            <button className="btn-login-green" onClick={handleLoginSubmit}>
              {authLoading ? 'Signing in...' : 'Access APMC Mandi Desk'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER OPERATOR WORKSPACE (COMPREHENSIVE APMC PROCUREMENT OPS)
  // =============================================================
  return (
    <div className="operator-layout">
      {/* SIDEBAR */}
      <aside className="op-sidebar">
        <div className="op-sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/farmsol_logo.jpg"
            alt="FARMSOL"
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #16a34a' }}
          />
          <div>
            <div className="op-brand-title">FARMSOL</div>
            <div className="op-brand-subtitle">APMC PROCUREMENT DESK</div>
          </div>
        </div>

        <nav className="op-sidebar-nav">
          <button className={`op-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`op-nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>Live Queue</button>
          <button className={`op-nav-item ${activeTab === 'gate' ? 'active' : ''}`} onClick={() => setActiveTab('gate')}>Gate Entry</button>
          <button className={`op-nav-item ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>Procurement</button>
          <button className={`op-nav-item ${activeTab === 'farmers' ? 'active' : ''}`} onClick={() => setActiveTab('farmers')}>Farmers Registry</button>
          <button className={`op-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments & DBT</button>
          <button className={`op-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Procurement History</button>
          <button className={`op-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`op-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
          <button className={`op-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="op-nav-item" style={{ color: '#ef4444' }} onClick={() => {
            persistentRepo.saveOperator(null);
            setIsAuthenticated(false);
            window.location.href = `http://${window.location.hostname}:3001?logout=true`;
          }}>
            Sign Out & Return to Portal
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="op-main-wrapper">
        {/* TOPBAR */}
        <header className="op-topbar">
          <div className="op-topbar-left">
            <div className="op-centre-badge" style={{ fontWeight: 800 }}>
              {currentOperator.centreName} ({currentOperator.location})
            </div>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
              ● GATE: OPEN
            </span>
          </div>

          <div className="op-topbar-right">
            <button className="btn-scan-qr" onClick={() => setShowGateScanModal(true)}>
              Scan Gate QR
            </button>
            <button className="btn-call-next" onClick={handleCallNextFarmer}>
              CALL NEXT FARMER
            </button>
            <div style={{ padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                {currentOperator.name.charAt(0)}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{currentOperator.name} ({currentOperator.id})</span>
            </div>
          </div>
        </header>

        <div className="op-content-body">
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD                                          */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="op-dashboard-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Good Day, Procurement Officer</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Here's today's live activity at APMC Centre #402 • Guaranteed MSP Procurement (Kharif 2026)
                  </p>
                </div>
              </div>

              {/* 8 Dynamic KPI Cards */}
              <div className="op-kpi-grid-8">
                <div className="op-kpi-box"><span className="op-kpi-title">TODAY'S BOOKINGS</span><span className="op-kpi-num">{queueList.length}</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">FARMERS ARRIVED</span><span className="op-kpi-num">{queueList.filter(q => q.status === 'ARRIVED' || q.status === 'WAITING' || q.status === 'PROCESSING' || q.status === 'COMPLETED').length}</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">CURRENTLY WAITING</span><span className="op-kpi-num">{queueList.filter(q => q.status === 'WAITING').length}</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">PROCESSING</span><span className="op-kpi-num">{currentServing ? 1 : 0}</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">COMPLETED TODAY</span><span className="op-kpi-num">{queueList.filter(q => q.status === 'COMPLETED').length}</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">TOTAL QUANTITY</span><span className="op-kpi-num">{queueList.reduce((acc, q) => acc + (q.quantityQuintals || 0), 0)} Qtl</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">AVG WAITING TIME</span><span className="op-kpi-num">~12 min</span></div>
                <div className="op-kpi-box"><span className="op-kpi-title">TODAY'S DBT PAYABLE</span><span className="op-kpi-num">₹{(queueList.reduce((acc, q) => acc + ((q.quantityQuintals || 0) * (q.mspRate || 2300)), 0) / 100000).toFixed(2)} L</span></div>
              </div>

              {/* Panels Grid: NOW SERVING vs NEXT IN QUEUE */}
              <div className="op-panels-grid">
                {/* NOW SERVING */}
                <div className="op-panel-card">
                  <div className="op-panel-header">
                    <span style={{ fontWeight: 800 }}>NOW SERVING</span>
                    {currentServing && (
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                        STAGE: {currentServing.stage}
                      </span>
                    )}
                  </div>

                  {currentServing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{currentServing.tokenId}</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentServing.farmerName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentServing.farmerPhone} • Vehicle: {currentServing.vehicleNo}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentServing.crop}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{currentServing.quantityQuintals} Quintals (Est.)</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Govt MSP: ₹{currentServing.mspRate}/Qtl</div>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div><strong>Moisture:</strong> {currentServing.moisture ? `${currentServing.moisture}% (≤17%)` : 'Pending'}</div>
                        <div><strong>Gross/Tare:</strong> {currentServing.grossWeight ? `${currentServing.grossWeight} / ${currentServing.tareWeight} kg` : 'Pending'}</div>
                        <div><strong>Net Produce:</strong> {currentServing.netQuintals ? `${currentServing.netQuintals} Qtl` : `${currentServing.quantityQuintals} Qtl`}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button className="btn-call-next" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowQualityModal(true)}>
                          Quality Assay
                        </button>
                        <button className="btn-scan-qr" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowWeighingModal(true)}>
                          Weighbridge
                        </button>
                        <button className="btn-call-next" style={{ background: '#16a34a', flex: 1.2, justifyContent: 'center' }} onClick={handleCompleteProcurement}>
                          Complete & DBT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="op-empty-panel">
                      <p style={{ fontWeight: 600 }}>No farmer currently being processed at the desk.</p>
                      <button className="btn-call-next" onClick={handleCallNextFarmer}>CALL NEXT FARMER</button>
                    </div>
                  )}
                </div>

                {/* NEXT IN QUEUE */}
                <div className="op-panel-card">
                  <div className="op-panel-header">
                    <span style={{ fontWeight: 800 }}>NEXT IN QUEUE</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {queueList.filter(q => q.status === 'WAITING' || q.status === 'ARRIVED').length} Waiting
                    </span>
                  </div>

                  {queueList.filter(q => q.status === 'WAITING' || q.status === 'ARRIVED').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {queueList
                        .filter(q => q.status === 'WAITING' || q.status === 'ARRIVED')
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div key={item.tokenId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>#{idx + 1} {item.tokenId} — {item.farmerName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.crop} • {item.quantityQuintals} Qtl • {item.slot}</div>
                            </div>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="op-empty-panel">
                      <p>No farmers currently waiting in queue.</p>
                      <span style={{ fontSize: '0.75rem' }}>Arriving farmers scanned at the gate will appear here.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: LIVE QUEUE MANAGEMENT                              */}
          {/* ========================================================= */}
          {activeTab === 'queue' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Live Mandi Queue Management</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time token queue synchronized with electronic weighbridge & quality lab.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-scan-qr" onClick={() => setShowGateScanModal(true)}>
                    Gate Check-In
                  </button>
                  <button className="btn-call-next" onClick={handleCallNextFarmer}>
                    CALL NEXT
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div className="op-filter-chips" style={{ marginBottom: 0 }}>
                  {['All', 'Arrived', 'Waiting', 'Processing', 'Completed', 'Booked'].map((c, i) => (
                    <button key={i} className={`op-chip ${activeFilter === c ? 'active' : ''}`} onClick={() => setActiveFilter(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative', width: 260 }}>
                  <input
                    type="text"
                    placeholder="Search token, farmer, crop..."
                    className="input-box-auth"
                    style={{ fontSize: '0.82rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>TOKEN ID</th>
                    <th style={{ padding: '10px 12px' }}>FARMER NAME</th>
                    <th style={{ padding: '10px 12px' }}>CROP & QUANTITY</th>
                    <th style={{ padding: '10px 12px' }}>SLOT / ARRIVAL</th>
                    <th style={{ padding: '10px 12px' }}>STATUS / STAGE</th>
                    <th style={{ padding: '10px 12px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item) => (
                    <tr key={item.tokenId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12, fontWeight: 800, color: 'var(--primary)' }}>{item.tokenId}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 700 }}>{item.farmerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.farmerPhone}</div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <div>{item.crop}</div>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.quantityQuintals} Quintals</span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <div>{item.slot}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gate: {item.arrivedAt}</span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            background: item.status === 'COMPLETED' ? '#dcfce7' : item.status === 'PROCESSING' ? '#dbeafe' : '#fef3c7',
                            color: item.status === 'COMPLETED' ? '#15803d' : item.status === 'PROCESSING' ? '#1d4ed8' : '#b45309',
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        >
                          {item.stage || item.status}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {item.status !== 'COMPLETED' && (
                            <button
                              style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                              onClick={() => {
                                setCurrentServing(item);
                                setActiveTab('dashboard');
                              }}
                            >
                              Serve
                            </button>
                          )}
                          <button
                            style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.72rem', cursor: 'pointer' }}
                            onClick={() => alert(`Farmer Details:\nName: ${item.farmerName}\nPhone: ${item.farmerPhone}\nVehicle: ${item.vehicleNo || 'N/A'}`)}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: GATE ENTRY VERIFICATION                            */}
          {/* ========================================================= */}
          {activeTab === 'gate' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>Digital Gate Entry Scanner</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>Scan farmer Gate Pass QR code or verify token number manually.</p>

                <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 20, background: '#f8fafc' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Camera Ready for Gate Pass QR</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Position farmer's mobile screen or printed pass in front of scanner</p>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="form-label-auth">Or Enter Gate Pass Token ID</label>
                  <input type="text" className="input-box-auth" value={scanInputToken} onChange={(e) => setScanInputToken(e.target.value)} placeholder="e.g. PDC-774321" />
                </div>

                <button className="btn-login-green" onClick={handleGateScanSubmit}>
                  Verify & Admit to Mandi Queue
                </button>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Today's Gate Check-In Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {queueList.slice(0, 4).map((q) => (
                    <div key={q.tokenId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{q.tokenId} — {q.farmerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vehicle: {q.vehicleNo} • Crop: {q.crop}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>Admitted</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PROCUREMENT WORKBENCH                              */}
          {/* ========================================================= */}
          {activeTab === 'procurement' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>Government Procurement Workbench</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>3-Stage Assaying & Weighing Workflow for Minimum Support Price (MSP) settlement.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>1</div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>Quality Assay</h4>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>Test moisture % (Govt Max ≤ 17.0%), foreign matter %, and issue Grade A certification.</p>
                  <button className="btn-call-next" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowQualityModal(true)}>
                    Run Lab Assay
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>2</div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>Weighbridge</h4>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>Electronic gross weight minus tare weight to calculate net produce in Quintals.</p>
                  <button className="btn-scan-qr" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowWeighingModal(true)}>
                    Record Net Weight
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>3</div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>DBT Payout</h4>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>Issue official DoCA procurement certificate & trigger direct DBT to bank A/C.</p>
                  <button className="btn-call-next" style={{ background: '#16a34a', width: '100%', justifyContent: 'center' }} onClick={handleCompleteProcurement}>
                    Complete & Issue DBT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: FARMERS REGISTRY                                   */}
          {/* ========================================================= */}
          {activeTab === 'farmers' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mandi Farmers Registry</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified Aadhaar-linked agricultural landholders in APMC Centre #402 jurisdiction.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>FARMER ID & NAME</th>
                    <th style={{ padding: '10px 12px' }}>VILLAGE</th>
                    <th style={{ padding: '10px 12px' }}>AADHAAR</th>
                    <th style={{ padding: '10px 12px' }}>VERIFIED BANK</th>
                    <th style={{ padding: '10px 12px' }}>TOTAL SOLD</th>
                    <th style={{ padding: '10px 12px' }}>DBT EARNED</th>
                  </tr>
                </thead>
                <tbody>
                  {farmersList.map((f) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 800 }}>{f.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.id} • {f.phone}</div>
                      </td>
                      <td style={{ padding: 12 }}>{f.village}</td>
                      <td style={{ padding: 12 }}>{f.aadhaar}</td>
                      <td style={{ padding: 12, color: 'var(--primary)', fontWeight: 600 }}>{f.bank}</td>
                      <td style={{ padding: 12, fontWeight: 700 }}>{f.totalSold} Qtl</td>
                      <td style={{ padding: 12, fontWeight: 800, color: '#16a34a' }}>₹{f.dbtReceived.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: PAYMENTS & DBT LEDGER                              */}
          {/* ========================================================= */}
          {activeTab === 'payments' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Direct Benefit Transfer (DBT) Ledger</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Direct payments processed under DoCA guaranteed MSP framework.</p>
                </div>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 8, fontWeight: 800, fontSize: '0.85rem' }}>
                  Total DBT Disbursed: ₹8,54,430
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>DBT TXN ID</th>
                    <th style={{ padding: '10px 12px' }}>FARMER & TOKEN</th>
                    <th style={{ padding: '10px 12px' }}>CROP & WEIGHT</th>
                    <th style={{ padding: '10px 12px' }}>MSP RATE</th>
                    <th style={{ padding: '10px 12px' }}>AMOUNT CREDITED</th>
                    <th style={{ padding: '10px 12px' }}>BANK / UTR</th>
                    <th style={{ padding: '10px 12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsLedger.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12, fontWeight: 800, color: 'var(--primary)' }}>{p.id}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 700 }}>{p.farmer}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token: {p.tokenId}</div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <div>{p.crop}</div>
                        <span style={{ fontWeight: 700 }}>{p.weight} Qtl</span>
                      </td>
                      <td style={{ padding: 12 }}>₹{p.msp}/Qtl</td>
                      <td style={{ padding: 12, fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontSize: '0.8rem' }}>{p.bank}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UTR: {p.utr}</div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 9999, fontWeight: 700, fontSize: '0.72rem' }}>
                          Transferred
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: PROCUREMENT HISTORY                                */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Historical Procurement Receipts</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Archived procurement slips and digital assay records.</p>
                </div>
                <button className="btn-scan-qr" onClick={() => alert('Exporting all procurement receipts to CSV...')}>
                  Export CSV
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {queueList.map((q) => (
                  <div key={q.tokenId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{q.tokenId} — {q.farmerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.crop} • {q.quantityQuintals} Qtl • Slot: {q.slot} • Centre #402</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(q.quantityQuintals * q.mspRate).toLocaleString('en-IN')}</span>
                      <button className="btn-call-next" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleOpenPrintSlip(q)}>
                        Print Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: ANALYTICS & REPORTS                                */}
          {/* ========================================================= */}
          {(activeTab === 'analytics' || activeTab === 'reports') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Hourly Arrival Throughput</h3>
                <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                  {[
                    { slot: '7-9 AM', count: 6, h: 60 },
                    { slot: '9-11 AM', count: 12, h: 120 },
                    { slot: '11-1 PM', count: 18, h: 160 },
                    { slot: '1-3 PM', count: 8, h: 80 },
                    { slot: '3-5 PM', count: 4, h: 40 }
                  ].map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 32, height: s.h, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{s.slot}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Moisture Quality Compliance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span>Optimal Moisture (≤ 14.0%)</span>
                      <strong>74%</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '74%', height: '100%', background: '#16a34a' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span>Acceptable (14.1% - 17.0%)</span>
                      <strong>22%</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '22%', height: '100%', background: '#3b82f6' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span>High Moisture (&gt; 17.0% - Requires Drying)</span>
                      <strong>4%</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '4%', height: '100%', background: '#ef4444' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: SETTINGS                                           */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 640 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>APMC Mandi Operating Configurations</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>Centre #402 parameters and weighbridge sensor calibration.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label-auth">APMC Centre Name</label>
                  <input type="text" className="input-box-auth" defaultValue="APMC Procurement Centre #402 (Guntur Central)" />
                </div>
                <div>
                  <label className="form-label-auth">Electronic Weighbridge Scale ID</label>
                  <input type="text" className="input-box-auth" defaultValue="WB-GNT-SCALE-01 (Calibrated: 01-Aug-2026)" />
                </div>
                <div>
                  <label className="form-label-auth">Digital Moisture Meter Device ID</label>
                  <input type="text" className="input-box-auth" defaultValue="MM-KHARIF-2026-99" />
                </div>
                <div>
                  <label className="form-label-auth">Daily Intake Capacity Quota</label>
                  <input type="text" className="input-box-auth" defaultValue="1200 Quintals / Day" />
                </div>
                <button className="btn-login-green" onClick={() => alert('Mandi configuration updated successfully.')}>
                  Save APMC Configurations
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: GATE SCAN MODAL                                  */}
      {/* ========================================================= */}
      {showGateScanModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Gate Entry QR / Token Verification</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>Admit farmer vehicle into APMC Mandi holding queue.</p>
            <input type="text" className="input-box-auth" value={scanInputToken} onChange={(e) => setScanInputToken(e.target.value)} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-scan-qr" style={{ flex: 1 }} onClick={() => setShowGateScanModal(false)}>Cancel</button>
              <button className="btn-call-next" style={{ flex: 1 }} onClick={handleGateScanSubmit}>Verify & Admit</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: QUALITY ASSAY MODAL                              */}
      {/* ========================================================= */}
      {showQualityModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>Quality & Moisture Laboratory Assay</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Government Kharif 2026 Procurement Standard (Paddy Grade A Limit: Moisture ≤ 17.0%, Base Standard ≤ 14.0%)
            </p>
            
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Moisture Percentage (%) <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                className="input-box-auth"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Foreign Matter / Inert Dockage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="input-box-auth"
                value={foreignMatter}
                onChange={(e) => setForeignMatter(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">Assayed Produce Grade</label>
              <select className="input-box-auth" value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)}>
                <option value="GRADE_A">Grade A (Guaranteed Full MSP Rate)</option>
                <option value="COMMON">Common Standard Produce</option>
              </select>
            </div>

            {/* Live Dynamic Quality Assessment Box */}
            <div style={{
              background: moisture > 17.0 ? '#fef2f2' : moisture > 14.0 ? '#fffbeb' : '#f0fdf4',
              border: `1.5px solid ${moisture > 17.0 ? '#ef4444' : moisture > 14.0 ? '#f59e0b' : '#22c55e'}`,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: moisture > 17.0 ? '#b91c1c' : moisture > 14.0 ? '#b45309' : '#15803d', marginBottom: 4 }}>
                {moisture > 17.0 ? 'CRITICAL: EXCEEDS 17.0% CEILING' : moisture > 14.0 ? 'ACCEPTABLE WITH MOISTURE DOCKAGE' : 'OPTIMAL DRY PRODUCE (PASS)'}
              </div>
              <div>
                {moisture > 17.0
                  ? `Moisture ${moisture}% is above the mandated 17.0% government limit. Produce cannot be accepted without re-drying.`
                  : moisture > 14.0
                  ? `Excess moisture: ${(moisture - 14.0).toFixed(1)}%. Dynamic dockage penalty of ${((moisture - 14.0) * 0.5).toFixed(2)}% will be deducted from net weight.`
                  : `Moisture ${moisture}% is within the ideal 14.0% base standard. Zero dockage penalty applied.`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-scan-qr" style={{ flex: 1 }} onClick={() => setShowQualityModal(false)}>Cancel</button>
              <button className="btn-call-next" style={{ flex: 1 }} onClick={handleSaveQualityAssay}>Save & Forward</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ELECTRONIC WEIGHBRIDGE DYNAMIC CALCULATOR       */}
      {/* ========================================================= */}
      {showWeighingModal && (() => {
        const liveNetKg = Math.max(0, grossWeight - tareWeight);
        const liveNetQtl = Number((liveNetKg / 100).toFixed(2));
        const liveMoisture = currentServing?.moisture || moisture || 14.0;
        const liveExcessMoisture = Math.max(0, liveMoisture - 14.0);
        const liveDockageKg = liveExcessMoisture > 0 ? Number((liveNetKg * (liveExcessMoisture * 0.005)).toFixed(1)) : 0;
        const liveDockageQtl = Number((liveDockageKg / 100).toFixed(2));
        const liveBillableQtl = Number(Math.max(0, liveNetQtl - liveDockageQtl).toFixed(2));
        const liveMspRate = currentServing?.mspRate || 2300;
        const liveTotalPayout = Math.round(liveBillableQtl * liveMspRate);

        return (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: 520 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Electronic Weighbridge Calculator</h3>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  LIVE DYNAMIC
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Instant dynamic calculations based on electronic gross and tare load cell telemetry.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label-auth">Gross Loaded Vehicle (Kg) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="10"
                    className="input-box-auth"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="form-label-auth">Tare Empty Vehicle (Kg) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="10"
                    className="input-box-auth"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Dynamic Mathematical Breakdown Box */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Gross Produce Weight:</span>
                  <strong>{liveNetKg.toLocaleString('en-IN')} kg ({liveNetQtl} Quintals)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Assayed Moisture Level:</span>
                  <span>{liveMoisture}% {liveExcessMoisture > 0 ? `(+${liveExcessMoisture.toFixed(1)}% excess)` : '(Base Standard)'}</span>
                </div>
                {liveDockageKg > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#b45309' }}>
                    <span>Moisture Dockage Penalty:</span>
                    <strong>- {liveDockageKg} kg (- {liveDockageQtl} Qtl)</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Final Settlement Produce:</span>
                  <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{liveBillableQtl} Quintals</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Govt Guaranteed MSP Rate:</span>
                  <strong>₹{liveMspRate.toLocaleString('en-IN')} / Quintal</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '8px 12px',
                  borderRadius: 6,
                  marginTop: 6
                }}>
                  <span style={{ fontWeight: 800, color: '#166534' }}>TOTAL DBT PAYOUT:</span>
                  <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d' }}>
                    ₹{liveTotalPayout.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-scan-qr" style={{ flex: 1 }} onClick={() => setShowWeighingModal(false)}>Cancel</button>
                <button className="btn-call-next" style={{ flex: 1.2, background: '#16a34a' }} onClick={handleConfirmWeighing}>
                  Confirm & Commit Weight
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL 4: PROCUREMENT CERTIFICATE MODAL                    */}
      {/* ========================================================= */}
      {showCertModal && completedCertData && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 500, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>Procurement Completed!</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Official DoCA Procurement Certificate Issued & DBT Triggered</p>

            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 16, textAlign: 'left', fontSize: '0.85rem', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Certificate No:</span>
                <strong>{completedCertData.certNo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Farmer Name:</span>
                <strong>{completedCertData.farmerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Procured Net Weight:</span>
                <strong>{completedCertData.netQuintals} Quintals</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Govt MSP Rate:</span>
                <strong>₹{completedCertData.mspRate} / Qtl</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: 6, marginTop: 6 }}>
                <span style={{ fontWeight: 800 }}>Total DBT Payable:</span>
                <strong style={{ color: '#15803d', fontSize: '1rem' }}>₹{completedCertData.totalPayout.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button className="btn-login-green" onClick={() => setShowCertModal(false)}>
              Done & Return to Desk
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: PRINTABLE OFFICIAL APMC PROCUREMENT CERTIFICATE  */}
      {/* ========================================================= */}
      {showPrintSlipModal && selectedPrintSlipData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580, padding: 28, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header Banner */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #15803d', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1 }}>
                GOVERNMENT OF ANDHRA PRADESH • APMC MANDI BOARD
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                Official Procurement Certificate & Confirmation Slip
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Certificate #: {selectedPrintSlipData.certNo} • Issued: {selectedPrintSlipData.date}</div>
            </div>

            {/* Profiles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.82rem', marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginBottom: 4 }}>FARMER PROFILE</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{selectedPrintSlipData.farmerName}</div>
                <div>ID: {selectedPrintSlipData.farmerId}</div>
                <div>Mobile: {selectedPrintSlipData.farmerPhone}</div>
                <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 4 }}>✓ Aadhaar DBT Linked</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginBottom: 4 }}>APMC CENTRE LOCATION</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPrintSlipData.centre}</div>
                <div>{selectedPrintSlipData.location}</div>
                <div>Operator: {selectedPrintSlipData.operatorName} ({selectedPrintSlipData.operatorId})</div>
              </div>
            </div>

            {/* Produce Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: 8 }}>TOKEN ID</th>
                  <th style={{ padding: 8 }}>COMMODITY</th>
                  <th style={{ padding: 8 }}>MOISTURE</th>
                  <th style={{ padding: 8 }}>NET WEIGHT</th>
                  <th style={{ padding: 8 }}>MSP RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 8, fontWeight: 800 }}>{selectedPrintSlipData.tokenId}</td>
                  <td style={{ padding: 8 }}>{selectedPrintSlipData.crop}</td>
                  <td style={{ padding: 8, color: '#16a34a', fontWeight: 700 }}>{selectedPrintSlipData.moisture}% (≤17%)</td>
                  <td style={{ padding: 8, fontWeight: 800, color: '#2563eb' }}>{selectedPrintSlipData.netQuintals} Qtl</td>
                  <td style={{ padding: 8, fontWeight: 800, color: '#15803d' }}>₹{selectedPrintSlipData.mspRate}/Qtl</td>
                </tr>
              </tbody>
            </table>

            {/* Financial Payout Summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 14, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534' }}>GROSS PAYOUT AMOUNT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>₹{selectedPrintSlipData.totalPayout.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>BANK ACCOUNT</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{selectedPrintSlipData.bankAccount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>UTR: {selectedPrintSlipData.utrRef}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', marginTop: 8, textAlign: 'center' }}>
                {selectedPrintSlipData.dbtStatus}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowPrintSlipModal(false)}>Close</button>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#15803d', color: '#ffffff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => window.print()}>
                Print Official Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SETTLEMENT & DBT DISBURSAL MODAL */}
      {showPaymentModal && currentServing && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header-flex">
              <div>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  STEP 5 • FINANCIAL SETTLEMENT
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 4 }}>
                  Disburse Payment & Settle DBT
                </h3>
              </div>
              <button
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Farmer & Payout Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, margin: '14px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>FARMER & TOKEN</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentServing.farmerName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>Token: {currentServing.tokenId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>COMMODITY & NET WEIGHT</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentServing.crop}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {currentServing.netQuintals || ((currentServing.grossWeight - currentServing.tareWeight) / 100) || currentServing.quantityQuintals} Qtl @ ₹{currentServing.mspRate}/Qtl
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>TOTAL PAYABLE AMOUNT:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
                  ₹{((currentServing.netQuintals || ((currentServing.grossWeight - currentServing.tareWeight) / 100) || currentServing.quantityQuintals) * currentServing.mspRate).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Status Choice (COMPLETED vs PENDING) */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                SELECT PAYMENT SETTLEMENT STATUS *
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 12,
                    borderRadius: 10,
                    border: paymentStatusChoice === 'COMPLETED' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: paymentStatusChoice === 'COMPLETED' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatusChoice === 'COMPLETED'}
                    onChange={() => setPaymentStatusChoice('COMPLETED')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.9rem' }}>
                      Mark as COMPLETED (Funds Released via DBT / Direct Transfer)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                      Payment credited directly to farmer's Aadhaar bank account. Dispatches instant confirmation SMS with UTR reference.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 12,
                    borderRadius: 10,
                    border: paymentStatusChoice === 'PENDING' ? '2px solid #d97706' : '1px solid #cbd5e1',
                    background: paymentStatusChoice === 'PENDING' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatusChoice === 'PENDING'}
                    onChange={() => setPaymentStatusChoice('PENDING')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.9rem' }}>
                      Mark as PENDING (Awaiting Bank Authorization / Review)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                      Payment record saved with Pending status. Dispatches SMS alert notifying farmer that amount is in processing queue.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bank UTR & Notes */}
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Bank UTR / Transaction Reference *</label>
              <input
                type="text"
                className="input-box-auth"
                value={paymentUtrInput}
                onChange={(e) => setPaymentUtrInput(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label-auth">Operator Notes & Verification Remarks</label>
              <input
                type="text"
                className="input-box-auth"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-header-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowPaymentModal(false)}
                disabled={isSettlingPayment}
              >
                Cancel
              </button>
              <button
                className="btn-login-green"
                style={{ flex: 1.5, background: paymentStatusChoice === 'COMPLETED' ? '#16a34a' : '#d97706' }}
                onClick={handleSettlePayment}
                disabled={isSettlingPayment}
              >
                {isSettlingPayment ? 'Disbursing & Notifying...' : `Confirm ${paymentStatusChoice} & Send SMS`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
