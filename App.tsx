import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Platform,
  Image
} from 'react-native';

const getNativeHost = () => {
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

// -----------------------------------------------------------------------------
// MULTI-LANGUAGE DICTIONARY (TELUGU-FIRST, HINDI, ENGLISH)
// -----------------------------------------------------------------------------
type Language = 'te' | 'hi' | 'en';
type UserRole = 'farmer' | 'operator' | 'admin';

const i18n = {
  te: {
    portalName: 'స్మార్ట్ ప్రొక్యూర్ కిసాన్ ఆప్',
    govBadge: 'భారత ప్రభుత్వ వినియోగదారుల వ్యవహారాల శాఖ (DoCA)',
    loginTitle: 'రైతు మొబైల్ ప్రవేశం',
    loginSub: 'మీ మొబైల్ నంబర్ మరియు OTP ద్వారా లాగిన్ అవ్వండి',
    phoneLabel: 'మొబైల్ సంఖ్య',
    sendOtp: 'OTP పంపండి',
    verifyOtp: 'OTP ధృవీకరించు & ప్రవేశించు',
    otpLabel: '6-అంకెల OTP నమోదు చేయండి (డిఫాల్ట్: 123456)',
    farmerIdLabel: 'రైతు గుర్తింపు సంఖ్య',
    greeting: 'నమస్కారం',
    activeToken: 'యాక్టివ్ బుకింగ్ టోకెన్',
    queuePos: 'క్యూ స్థానం',
    estWait: 'అంచనా వేచి ఉండే సమయం',
    farmersAhead: 'ముందున్న రైతులు',
    currentStage: 'ప్రస్తుత ప్రక్రియ దశ',
    voiceBtn: 'వాయిస్ చదవండి',
    bookSlot: 'స్లాట్ బుక్ చేయండి',
    selectCentre: '1. ప్రొక్యూర్మెంట్ కేంద్రాన్ని ఎంచుకోండి',
    selectCrop: '2. పంట & పరిమాణం (క్వింటాళ్లలో)',
    selectSlot: '3. తేదీ & స్మార్ట్ స్లాట్ ఎంచుకోండి',
    reviewBooking: '4. వివరాల పరిశీలన',
    confirmBooking: 'బుకింగ్ ఖరారు చేయండి',
    reschedule: 'రీషెడ్యూల్',
    cancelBooking: 'బుకింగ్ రద్దు చేయండి',
    qrTitle: 'అధికారిక APMC గేట్ పాస్ QR',
    scanInstructions: 'మండి ప్రవేశ ద్వారం #1 వద్ద ఈ QR కోడ్‌ను చూపించండి',
    passbookTitle: 'డిబిటి (DBT) బ్యాంక్ పాస్‌బుక్',
    mspRate: 'ప్రభుత్వ మద్దతు ధర (MSP)',
    payout: 'అంచనా మొత్తం',
    bankDetails: 'బ్యాంక్ ఖాతా వివరాలు',
    editBank: 'వివరాలు సవరించండి',
    saveBank: 'భద్రపరచండి',
    marketPrices: 'లైవ్ మార్కెట్ ధరలు vs MSP',
    grievances: 'సమస్యల ఫిర్యాదు విభాగం',
    submitGrievance: 'ఫిర్యాదు నమోదు చేయండి',
    notifications: 'నోటిఫికేషన్లు',
    operatorDesk: 'మండి ఆపరేటర్ డెస్క్',
    adminDesk: 'కేంద్ర అడ్మిన్ పోర్టల్',
    logout: 'లాగౌట్'
  },
  hi: {
    portalName: 'स्मार्ट प्रोक्योर किसान ऐप',
    govBadge: 'उपभोक्ता मामले विभाग (DoCA), भारत सरकार',
    loginTitle: 'किसान मोबाइल लॉगिन',
    loginSub: 'अपने मोबाइल नंबर और ओटीपी से लॉगिन करें',
    phoneLabel: 'मोबाइल नंबर',
    sendOtp: 'ओटीपी भेजें',
    verifyOtp: 'ओटीपी सत्यापित करें',
    otpLabel: '6-अंकों का ओटीपी दर्ज करें (123456)',
    farmerIdLabel: 'किसान पहचान संख्या',
    greeting: 'नमस्ते',
    activeToken: 'सक्रिय बुकिंग टोकन',
    queuePos: 'कतार स्थिति',
    estWait: 'अनुमानित प्रतीक्षा समय',
    farmersAhead: 'आगे किसान',
    currentStage: 'वर्तमान चरण',
    voiceBtn: 'आवाज़ सुनें',
    bookSlot: 'स्लॉट बुक करें',
    selectCentre: '1. खरीद केंद्र चुनें',
    selectCrop: '2. फसल और मात्रा (क्विंटल)',
    selectSlot: '3. तिथि और स्मार्ट स्लॉट चुनें',
    reviewBooking: '4. विवरण समीक्षा',
    confirmBooking: 'बुकिंग की पुष्टि करें',
    reschedule: 'पुनर्निर्धारित करें',
    cancelBooking: 'बुकिंग रद्द करें',
    qrTitle: 'आधिकारिक एपीएमसी गेट पास क्यूआर',
    scanInstructions: 'मंडी गेट #1 पर यह क्यूआर दिखाएं',
    passbookTitle: 'डीबीटी बैंक पासबुक',
    mspRate: 'एमएसपी दर (MSP)',
    payout: 'कुल राशि',
    bankDetails: 'बैंक खाता विवरण',
    editBank: 'विवरण संपादित करें',
    saveBank: 'सहेजें',
    marketPrices: 'लाइव बाजार मूल्य बनाम एमएसपी',
    grievances: 'शिकायत निवारण',
    submitGrievance: 'शिकायत दर्ज करें',
    notifications: 'सूचनाएं',
    operatorDesk: 'ऑपरेटर डेस्क',
    adminDesk: 'एडमिन पोर्टल',
    logout: 'लॉगआउट'
  },
  en: {
    portalName: 'SmartProcure Kisan Mobile App',
    govBadge: 'Dept. of Consumer Affairs (DoCA), Govt of India',
    loginTitle: 'Farmer Access Portal',
    loginSub: 'Login securely with Mobile OTP',
    phoneLabel: 'Mobile Number',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP & Login',
    otpLabel: 'Enter 6-Digit OTP (Default: 123456)',
    farmerIdLabel: 'Farmer ID',
    greeting: 'Welcome Back',
    activeToken: 'ACTIVE BOOKING TOKEN',
    queuePos: 'Queue Position',
    estWait: 'Est. Waiting Time',
    farmersAhead: 'Farmers Ahead',
    currentStage: 'Current Queue Stage',
    voiceBtn: 'Voice Readout',
    bookSlot: 'Book Procurement Slot',
    selectCentre: '1. Select Procurement Centre',
    selectCrop: '2. Crop & Expected Quantity',
    selectSlot: '3. Select Date & Smart Slot',
    reviewBooking: '4. Review Booking Details',
    confirmBooking: 'Confirm & Generate Pass',
    reschedule: 'Reschedule',
    cancelBooking: 'Cancel Booking',
    qrTitle: 'OFFICIAL APMC GATE PASS QR',
    scanInstructions: 'Present this scannable QR Code at Mandi Gate #1',
    passbookTitle: 'Direct Benefit Transfer (DBT) Passbook',
    mspRate: 'Govt MSP Rate',
    payout: 'Gross Payout',
    bankDetails: 'Bank Account & Payout Details',
    editBank: 'Edit Details',
    saveBank: 'Save Details',
    marketPrices: 'Live APMC Market Prices vs MSP',
    grievances: 'Grievance & Support Desk',
    submitGrievance: 'Submit Grievance',
    notifications: 'Notifications & Alerts',
    operatorDesk: 'Connect to Mandi Operator Desk',
    adminDesk: 'Connect to DoCA Admin Governance Portal',
    logout: 'Logout'
  }
};

// -----------------------------------------------------------------------------
// INITIAL MASTER DATA (CENTRES, CROPS, SLOTS, OPERATORS, AUDIT LOGS)
// -----------------------------------------------------------------------------
const CENTRES_INIT = [
  { id: 'PC-402', name: 'Sri Lakshmi Procurement Centre #402', district: 'East Godavari', distance: '4.2 km', load: '38% Low Congestion', counters: 4, dailyQuota: 1200, activeWeighbridges: 3, operators: 4, status: 'Active' },
  { id: 'PC-108', name: 'Kadapa APMC Model Hub #108', district: 'Kadapa', distance: '8.5 km', load: '65% Moderate Load', counters: 3, dailyQuota: 800, activeWeighbridges: 2, operators: 3, status: 'Active' },
  { id: 'PC-204', name: 'Godavari Agricultural Mandi #204', district: 'West Godavari', distance: '12.0 km', load: '20% Low Load', counters: 5, dailyQuota: 2000, activeWeighbridges: 5, operators: 6, status: 'Active' }
];

const CROPS_INIT = [
  { id: 'CR-PADDY-A', name: 'Paddy (Grade A)', msp: 2300, marketPrice: 2380, season: 'Kharif 2026', unit: 'Quintal', varieties: ['BPT 5204', 'MTU 1010', 'Swarna'], moistureLimit: '≤ 17.0%' },
  { id: 'CR-PADDY-C', name: 'Paddy (Common)', msp: 2183, marketPrice: 2240, season: 'Kharif 2026', unit: 'Quintal', varieties: ['IR 64', 'Jaya', 'Nandyal'], moistureLimit: '≤ 17.0%' },
  { id: 'CR-COTTON', name: 'Cotton (Medium Staple)', msp: 6620, marketPrice: 6750, season: 'Kharif 2026', unit: 'Quintal', varieties: ['Bunny Bt', 'RCH 2'], moistureLimit: '≤ 12.0%' },
  { id: 'CR-WHEAT', name: 'Wheat (Sharbati)', msp: 2275, marketPrice: 2340, season: 'Rabi 2026', unit: 'Quintal', varieties: ['Sharbati Premium', 'HD 2967'], moistureLimit: '≤ 14.0%' },
  { id: 'CR-GND', name: 'Groundnut (Bold)', msp: 6377, marketPrice: 6500, season: 'Kharif 2026', unit: 'Quintal', varieties: ['Kadiri 6', 'Dharani'], moistureLimit: '≤ 10.0%' }
];

const SLOTS = [
  { id: 'SL-01', time: '09:00 AM - 11:00 AM', recommended: false, available: 12, waitMin: 25, reason: 'High Morning Load' },
  { id: 'SL-02', time: '11:00 AM - 01:00 PM', recommended: false, available: 8, waitMin: 35, reason: 'Peak Queue Hours' },
  { id: 'SL-03', time: '02:00 PM - 04:00 PM', recommended: true, available: 28, waitMin: 12, reason: 'Recommended: 38% lowest expected wait time' }
];

export default function App() {
  console.log('>>> [FARMSOL APP MOUNTED SUCCESSFULLY] <<<');
  // Global Role & Auth State
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [lang, setLang] = useState<Language>('te');
  const t = i18n[lang] || i18n.te;

  // Master State (Shared across all 3 portals in single Expo app)
  const [cropsList, setCropsList] = useState<any[]>(CROPS_INIT);
  const [centresList, setCentresList] = useState<any[]>(CENTRES_INIT);
  const [operatorsList, setOperatorsList] = useState<any[]>([
    { id: 'APMC-54031', name: 'Sai Kumar', email: 'saikumar448470@gmail.com', centre: 'Sri Lakshmi Procurement Centre (#402)', verified: 'Verified', status: 'Approved' },
    { id: 'APMC-0342', name: 'Pavan Surya', email: 'pavansurya9902@gmail.com', centre: 'Kadapa APMC Model Hub (#108)', verified: 'Verified', status: 'Approved' },
    { id: 'OP-104', name: 'Prudhvi Pavan', email: 'pardhupavan459@gmail.com', centre: 'Sri Lakshmi Procurement Centre (#402)', verified: 'Verified', status: 'Approved' },
    { id: 'OP-103', name: 'R. K. Verma', email: 'operator.guntur@apmc.gov.in', centre: 'Godavari Mandi (#204)', verified: 'Unverified', status: 'Pending Approval' }
  ]);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'AUD-903', action: 'DBT_PAYMENT_DISBURSED', user: 'DoCA Gateway', details: 'Rs. 1,03,500 transferred to Farmer Prudhvi for Token PDC-774321', time: '5 mins ago' },
    { id: 'AUD-902', action: 'WEIGHBRIDGE_RECORDED', user: 'Operator APMC-54031', details: 'Net Weight: 45.00 Qtl recorded at Centre #402', time: '12 mins ago' },
    { id: 'AUD-901', action: 'GATE_ENTRY_CHECKIN', user: 'Operator APMC-54031', details: 'Scanned digital QR Gate Pass for Token PDC-774321', time: '25 mins ago' }
  ]);

  // FARMER STATE
  const [mobileNumber, setMobileNumber] = useState<string>('9125421544');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('123456');
  const [farmerActiveTab, setFarmerActiveTab] = useState<'home' | 'book' | 'mybookings' | 'pass' | 'passbook' | 'prices' | 'grievance' | 'profile'>('home');
  const [farmer, setFarmer] = useState({
    id: 'FR-AP-2026-000124',
    name: 'Prudhvi Pavan',
    mobile: '+91 9125421544',
    village: 'Kadiyam',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    landAcres: '4.5 Acres (Verified)',
    bankName: 'State Bank of India',
    accNo: '3829104821',
    ifsc: 'SBIN0001429',
    upiId: 'prudhvi@ybl'
  });
  const [activeBooking, setActiveBooking] = useState<any>({
    bookingId: 'BK-2026-000845',
    tokenId: 'PDC-774321',
    centreName: 'Sri Lakshmi Procurement Centre #402',
    centreId: 'PC-402',
    cropName: 'Paddy (Grade A)',
    quantity: 45,
    bookingDate: '2026-09-10',
    timeSlot: '02:00 PM - 04:00 PM',
    stage: 'QUALITY ASSAYING',
    stageStep: 3,
    farmerToken: 105,
    farmersAhead: 2,
    estimatedWaitMinutes: 12,
    mspRate: 2300,
    grossPayout: 103500,
    paymentStatus: 'PAYMENT PENDING',
    paymentReference: 'UTR-20260902-88192'
  });
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedCentre, setSelectedCentre] = useState<any>(CENTRES_INIT[0]);
  const [selectedCrop, setSelectedCrop] = useState<any>(CROPS_INIT[0]);
  const [selectedVariety, setSelectedVariety] = useState<string>(CROPS_INIT[0].varieties[0]);
  const [expectedQty, setExpectedQty] = useState<string>('45');
  const [bookingDate, setBookingDate] = useState<string>('2026-09-10');
  const [selectedSlot, setSelectedSlot] = useState<any>(SLOTS[2]);
  const [editBankModal, setEditBankModal] = useState<boolean>(false);
  const [bankForm, setBankForm] = useState({ bankName: farmer.bankName, accNo: farmer.accNo, ifsc: farmer.ifsc, upiId: farmer.upiId });
  const [grievanceDesc, setGrievanceDesc] = useState<string>('');

  // OPERATOR STATE
  const [opActiveTab, setOpActiveTab] = useState<'dashboard' | 'queue' | 'gate' | 'procurement' | 'farmers' | 'payments'>('dashboard');
  const [opEmailInput, setOpEmailInput] = useState<string>('saikumar448470@gmail.com');
  const [opPasswordInput, setOpPasswordInput] = useState<string>('Pavan@2026Secure!');
  const [currentServing, setCurrentServing] = useState<any>({
    tokenId: 'PDC-774321',
    farmerName: 'Prudhvi Pavan',
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
  });
  const [queueList, setQueueList] = useState<any[]>([
    { tokenId: 'PDC-774321', farmerName: 'Prudhvi Pavan', farmerPhone: '+91 9125421544', crop: 'Paddy (Grade A)', quantityQuintals: 45, slot: '09:00 AM - 11:00 AM', status: 'PROCESSING', stage: 'QUALITY', arrivedAt: '09:05 AM', mspRate: 2300 },
    { tokenId: 'PDC-F51B1E', farmerName: 'V. Srinivasa Rao', farmerPhone: '+91 9848012345', crop: 'Cotton (Medium Staple)', quantityQuintals: 70, slot: '09:00 AM - 11:00 AM', status: 'WAITING', stage: 'WAITING', arrivedAt: '09:22 AM', mspRate: 6620 },
    { tokenId: 'PDC-384591', farmerName: 'K. Ramesh', farmerPhone: '+91 9440156789', crop: 'Paddy (Common)', quantityQuintals: 50, slot: '11:00 AM - 01:00 PM', status: 'ARRIVED', stage: 'GATE_ENTRY', arrivedAt: '10:45 AM', mspRate: 2183 }
  ]);
  const [showGateScanModal, setShowGateScanModal] = useState<boolean>(false);
  const [scanToken, setScanToken] = useState<string>('PDC-384591');
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [moistureVal, setMoistureVal] = useState<number>(14.2);
  const [foreignVal, setForeignVal] = useState<number>(1.1);
  const [showWeighingModal, setShowWeighingModal] = useState<boolean>(false);
  const [grossVal, setGrossVal] = useState<number>(7250);
  const [tareVal, setTareVal] = useState<number>(2750);
  const [showPrintReceipt, setShowPrintReceipt] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // ADMIN STATE
  const [adminActiveTab, setAdminActiveTab] = useState<'dashboard' | 'centres' | 'operators' | 'farmers' | 'crops' | 'audit'>('dashboard');
  const [adminEmailInput, setAdminEmailInput] = useState<string>('pardhupavan459@gmail.com');
  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [editMsp, setEditMsp] = useState<number>(2300);
  const [editMarketPrice, setEditMarketPrice] = useState<number>(2380);

  // Voice Assistant
  const handleVoiceReadout = () => {
    let msg = `Welcome ${farmer.name}. Active Token ${activeBooking?.tokenId || 'N/A'}. 2 farmers ahead of you. Estimated wait: 12 minutes.`;
    if (lang === 'te') msg = `నమస్కారం ${farmer.name}. మీ టోకెన్ నంబర్ ${activeBooking?.tokenId}. మీ ముందు 2 మంది రైతులు ఉన్నారు. అంచనా సమయం 12 నిమిషాలు.`;
    Alert.alert('Voice Assistant', msg);
  };

  // Farmer Handlers
  const handleConfirmBooking = () => {
    const newId = `TK-PC402-${Math.floor(100 + Math.random() * 900)}`;
    const qty = parseFloat(expectedQty) || 45;
    const payout = qty * selectedCrop.msp;
    const newB = {
      bookingId: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenId: newId,
      centreName: selectedCentre.name,
      centreId: selectedCentre.id,
      cropName: `${selectedCrop.name} (${selectedVariety})`,
      quantity: qty,
      bookingDate: bookingDate,
      timeSlot: selectedSlot.time,
      stage: 'ARRIVED AT GATE',
      stageStep: 1,
      farmerToken: Math.floor(100 + Math.random() * 50),
      farmersAhead: 3,
      estimatedWaitMinutes: 15,
      mspRate: selectedCrop.msp,
      grossPayout: payout,
      paymentStatus: 'PAYMENT PENDING',
      paymentReference: 'PENDING_GATE_ENTRY'
    };
    setActiveBooking(newB);
    Alert.alert('Booking Confirmed', `Token: ${newId}\nDate: ${bookingDate}\nSlot: ${selectedSlot.time}`);
    setBookingStep(1);
    setFarmerActiveTab('home');
  };

  // Operator Handlers
  const handleCallNextFarmer = () => {
    const next = queueList.find(q => q.status === 'WAITING' || q.status === 'ARRIVED');
    if (next) {
      setCurrentServing({ ...next, stage: 'QUALITY', grossWeight: 7250, tareWeight: 2750, moisture: 14.2 });
      setQueueList(queueList.map(q => q.tokenId === next.tokenId ? { ...q, status: 'PROCESSING', stage: 'QUALITY' } : q));
      Alert.alert('Calling Farmer', `Token #${next.tokenId} (${next.farmerName}) called to Quality Assay desk.`);
    } else {
      Alert.alert('Queue Empty', 'No waiting farmers in queue right now.');
    }
  };

  const handleGateScan = () => {
    const found = queueList.find(q => q.tokenId === scanToken.trim().toUpperCase());
    if (found) {
      setQueueList(queueList.map(q => q.tokenId === found.tokenId ? { ...q, status: 'WAITING', stage: 'WAITING' } : q));
      Alert.alert('Gate Verified', `Token #${found.tokenId} admitted to APMC Mandi.`);
    } else {
      Alert.alert('Gate Admitted', `Token #${scanToken} checked-in at Gate #1.`);
    }
    setShowGateScanModal(false);
  };

  const handleSaveAssay = () => {
    if (moistureVal > 17.0) {
      Alert.alert('High Moisture Warning', `Moisture is ${moistureVal}%, exceeding DoCA limit of 17.0%. Drying required.`);
      return;
    }
    if (currentServing) {
      setCurrentServing({ ...currentServing, stage: 'WEIGHING', moisture: moistureVal, foreignMatter: foreignVal });
    }
    setShowQualityModal(false);
    Alert.alert('Assay Certified', `Moisture: ${moistureVal}% (Limit <= 17%). Forwarded to Weighbridge.`);
  };

  const handleConfirmWeighing = () => {
    const netQtl = (grossVal - tareVal) / 100;
    if (currentServing) {
      setCurrentServing({ ...currentServing, stage: 'COMPLETED', grossWeight: grossVal, tareWeight: tareVal, netQuintals: netQtl });
      setQueueList(queueList.map(q => q.tokenId === currentServing.tokenId ? { ...q, status: 'COMPLETED', stage: 'COMPLETED', quantityQuintals: netQtl } : q));
    }
    setShowWeighingModal(false);
    Alert.alert('Weight Recorded', `Gross: ${grossVal} kg, Tare: ${tareVal} kg. Net: ${netQtl.toFixed(2)} Qtl.`);
  };

  const handleCompleteProcurement = () => {
    if (!currentServing) return;
    const netQtl = currentServing.netQuintals || ((currentServing.grossWeight - currentServing.tareWeight) / 100) || currentServing.quantityQuintals;
    const payout = netQtl * currentServing.mspRate;
    const cert = {
      certNo: `DOCA-PROC-${Math.floor(100000 + Math.random() * 900000)}`,
      tokenId: currentServing.tokenId,
      farmerName: currentServing.farmerName,
      crop: currentServing.crop,
      netQuintals: netQtl,
      mspRate: currentServing.mspRate,
      totalPayout: payout,
      date: '08 Sep 2026',
      centre: 'Sri Lakshmi Procurement Centre #402',
      utr: `UTR-20260908-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setReceiptData(cert);
    setShowPrintReceipt(true);
    setCurrentServing(null);
  };

  // Admin Handlers
  const handleSaveCropPrice = () => {
    if (!editingCrop) return;
    const updated = cropsList.map(c => c.id === editingCrop.id ? { ...c, msp: Number(editMsp), marketPrice: Number(editMarketPrice) } : c);
    setCropsList(updated);
    setEditingCrop(null);
    Alert.alert('Live Price Published', `Rates updated for ${editingCrop.name}: MSP Rs. ${editMsp}/Qtl & Market Rs. ${editMarketPrice}/Qtl across all Kisan apps.`);
  };

  const handleToggleOperatorStatus = (id: string) => {
    setOperatorsList(operatorsList.map(op => op.id === id ? { ...op, status: op.status === 'Approved' ? 'Pending Approval' : 'Approved' } : op));
  };

  // ===========================================================================
  // AUTHENTICATION SCREEN WITH IN-APP ROLE SELECTOR (FARMER / OPERATOR / ADMIN)
  // ===========================================================================
  if (!isAuthenticated) {
    return (
      <View style={[styles.authContainer, { flex: 1, backgroundColor: '#15803d' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#15803d" />
        <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginTop: 80, textAlign: 'center' }}>FARMSOL KISAN APP</Text>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Header Banner */}
          <View style={styles.authHeaderBanner}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#22c55e', shadowColor: '#15803d', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffffff' }}>FS</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#15803d', letterSpacing: 1.5, marginTop: 6 }}>FARMSOL</Text>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#166534', letterSpacing: 2 }}>— FARMER SOLUTIONS —</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Smart Procurement. Better Farming.</Text>
            </View>
            <Text style={styles.authGovBadge}>{t.govBadge}</Text>
            <Text style={styles.authHeaderTitle}>SmartProcure</Text>
            <Text style={styles.authHeaderSub}>Unified Procurement Operating System (SIH26032)</Text>
          </View>

          {/* Role Switcher Tabs */}
          <View style={styles.rolePickerBox}>
            <Text style={styles.rolePickerLabel}>SELECT YOUR PORTAL / ROLE:</Text>
            <View style={styles.rolePickerRow}>
              <TouchableOpacity style={[styles.roleTabBtn, userRole === 'farmer' && styles.roleTabBtnFarmer]} onPress={() => setUserRole('farmer')}>
                <Text style={[styles.roleTabText, userRole === 'farmer' && styles.roleTabTextActive]}>Farmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleTabBtn, userRole === 'operator' && styles.roleTabBtnOp]} onPress={() => setUserRole('operator')}>
                <Text style={[styles.roleTabText, userRole === 'operator' && styles.roleTabTextActive]}>Operator</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleTabBtn, userRole === 'admin' && styles.roleTabBtnAdmin]} onPress={() => setUserRole('admin')}>
                <Text style={[styles.roleTabText, userRole === 'admin' && styles.roleTabTextActive]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            {/* FARMER AUTH */}
            {userRole === 'farmer' && (
              <View>
                <Text style={styles.authCardTitle}>Farmer Mobile Access</Text>
                <Text style={styles.authCardSub}>Login with OTP to access slot bookings & DBT passbook</Text>

                <TouchableOpacity style={styles.demoLoginBtn} onPress={() => setIsAuthenticated(true)}>
                  <Text style={styles.demoLoginBtnText}>Instant Demo Login (Prudhvi Pavan)</Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <View style={styles.phoneInputWrap}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput style={styles.phoneInput} keyboardType="phone-pad" value={mobileNumber} onChangeText={setMobileNumber} maxLength={10} />
                </View>

                {otpSent ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.inputLabel}>Enter 6-Digit OTP (Default: 123456)</Text>
                    <TextInput style={styles.otpInput} keyboardType="numeric" value={otpCode} onChangeText={setOtpCode} maxLength={6} />
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsAuthenticated(true)}>
                      <Text style={styles.primaryBtnText}>Verify OTP & Open Kisan App</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setOtpSent(true)}>
                    <Text style={styles.primaryBtnText}>Send Mobile OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* OPERATOR AUTHENTICATION */}
            {userRole === 'operator' && (
              <View>
                <Text style={styles.authCardTitle}>Mandi Operator Desk Login</Text>
                <Text style={styles.authCardSub}>Authorized APMC Officers & Quality Assayers Access</Text>

                <TouchableOpacity style={[styles.demoLoginBtn, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]} onPress={() => { setUserRole('operator'); setIsAuthenticated(true); }}>
                  <Text style={[styles.demoLoginBtnText, { color: '#0369a1' }]}>Instant Operator Access (Officer Sai Kumar #402)</Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Official Officer Email *</Text>
                <TextInput style={styles.textInput} value={opEmailInput} onChangeText={setOpEmailInput} autoCapitalize="none" placeholder="officer@apmc.gov.in" />

                <Text style={styles.inputLabel}>Security Password *</Text>
                <TextInput style={styles.textInput} value={opPasswordInput} onChangeText={setOpPasswordInput} secureTextEntry placeholder="••••••••" />

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#0284c7' }]} onPress={() => { setUserRole('operator'); setIsAuthenticated(true); }}>
                  <Text style={styles.primaryBtnText}>Open Mandi Operator Desk</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ADMIN AUTHENTICATION */}
            {userRole === 'admin' && (
              <View>
                <Text style={styles.authCardTitle}>DoCA Central Governance Login</Text>
                <Text style={styles.authCardSub}>Ministry of Consumer Affairs & Food Security Portal</Text>

                <TouchableOpacity style={[styles.demoLoginBtn, { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }]} onPress={() => { setUserRole('admin'); setIsAuthenticated(true); }}>
                  <Text style={[styles.demoLoginBtnText, { color: '#273b64' }]}>Instant DoCA Central Governance Access</Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Ministry Officer ID / Email *</Text>
                <TextInput style={styles.textInput} value="admin.food@nic.in" editable={false} />

                <Text style={styles.inputLabel}>Security PIN / Password *</Text>
                <TextInput style={styles.textInput} value="••••••••" editable={false} secureTextEntry />

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#273b64' }]} onPress={() => { setUserRole('admin'); setIsAuthenticated(true); }}>
                  <Text style={styles.primaryBtnText}>Access Governance Central Portal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ===========================================================================
  // MAIN WORKSPACE LAYOUT (IN-APP MULTI-ROLE SWITCHER TOP BAR + PORTALS)
  // ===========================================================================
  return (
    <View style={[styles.container, { flex: 1, backgroundColor: '#f8fafc' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* TOP MASTER HEADER WITH INSTANT MULTI-PORTAL SWITCHER */}
      <View style={styles.topMasterBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: userRole === 'farmer' ? '#15803d' : userRole === 'operator' ? '#0369a1' : '#273b64' }}>
            {userRole === 'farmer' ? (lang === 'te' ? 'రైతు పోర్టల్' : lang === 'hi' ? 'किसान मोबाइल' : 'Farmer Mobile') : userRole === 'operator' ? 'Mandi Operator Desk' : 'DoCA Governance'}
          </Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>FARMSOL Unified Operating System</Text>
        </View>

        {/* IN-APP INSTANT PORTAL SWITCHER */}
        <View style={styles.roleSwitcherHeaderRow}>
          <TouchableOpacity 
            style={[styles.miniRoleBtn, userRole === 'farmer' && styles.miniRoleBtnActive]} 
            onPress={() => setUserRole('farmer')}>
            <Text style={[styles.miniRoleText, userRole === 'farmer' && styles.miniRoleTextActive]}>Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.miniRoleBtn, userRole === 'operator' && { backgroundColor: '#0284c7' }]} 
            onPress={() => setUserRole('operator')}>
            <Text style={[styles.miniRoleText, userRole === 'operator' && styles.miniRoleTextActive]}>Operator</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.miniRoleBtn, userRole === 'admin' && { backgroundColor: '#273b64' }]} 
            onPress={() => setUserRole('admin')}>
            <Text style={[styles.miniRoleText, userRole === 'admin' && styles.miniRoleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtnMini} onPress={() => setIsAuthenticated(false)}>
          <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: 'bold', marginLeft: 6 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* =======================================================================
          PORTAL 1: FARMER KISAN APP
         ======================================================================= */}
      {userRole === 'farmer' && (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* Greeting & Language Switcher */}
            <View style={styles.welcomeBanner}>
              <View>
                <Text style={styles.greetingTitle}>{t.greeting}, {farmer.name}</Text>
                <Text style={styles.greetingSub}>{farmer.village}, {farmer.district} • {farmer.landAcres}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.voiceBtn} onPress={handleVoiceReadout}>
                  <Text style={styles.voiceBtnText}>{t.voiceBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.langSelectBtn} onPress={() => setLang(lang === 'te' ? 'en' : lang === 'en' ? 'hi' : 'te')}>
                  <Text style={styles.langSelectBtnText}>{lang.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TAB: HOME DASHBOARD */}
            {farmerActiveTab === 'home' && (
              <View>
                {activeBooking ? (
                  <View style={styles.activeCard}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.activeCardTag}>{t.activeToken}</Text>
                      <Text style={styles.tokenBadge}>{activeBooking.tokenId}</Text>
                    </View>
                    <Text style={styles.cropTitle}>{activeBooking.cropName} • {activeBooking.quantity} Qtl</Text>
                    <Text style={styles.centreSub}>{activeBooking.centreName}</Text>
                    <Text style={styles.slotSub}>{activeBooking.bookingDate} | {activeBooking.timeSlot}</Text>

                    <View style={styles.statsMatrix}>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{t.queuePos}</Text>
                        <Text style={styles.statValHighlight}>{activeBooking.farmersAhead} {t.farmersAhead}</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{t.estWait}</Text>
                        <Text style={styles.statValHighlight}>~{activeBooking.estimatedWaitMinutes} min</Text>
                      </View>
                    </View>

                    <View style={styles.pipelineCard}>
                      <Text style={styles.pipelineTitle}>{t.currentStage}: {activeBooking.stage}</Text>
                      <View style={styles.stageProgressTrack}>
                        {['Gate', 'Waiting', 'Assay', 'Weight', 'Procured', 'Paid'].map((st, i) => (
                          <View key={i} style={styles.stageStepItem}>
                            <View style={[styles.stepDot, activeBooking.stageStep >= (i + 1) ? styles.stepDotActive : styles.stepDotPending]}>
                              <Text style={styles.stepNum}>{i + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{st}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.passBtn} onPress={() => setFarmerActiveTab('pass')}>
                        <Text style={styles.passBtnText}>{t.qrTitle}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.passBtn, { backgroundColor: '#15803d' }]} onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=16.9891,82.2475&travelmode=driving')}>
                        <Text style={styles.passBtnText}>Maps Directions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rescheduleBtn} onPress={() => setFarmerActiveTab('book')}>
                        <Text style={styles.rescheduleBtnText}>{t.reschedule}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Active Booking</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setFarmerActiveTab('book')}>
                      <Text style={styles.primaryBtnText}>Book Procurement Slot</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Market Price Preview */}
                <TouchableOpacity style={styles.priceOverviewCard} onPress={() => setFarmerActiveTab('prices')}>
                  <Text style={styles.priceHeaderTitle}>Live Market Prices vs MSP</Text>
                  <Text style={styles.priceCropRow}>Paddy Grade A: MSP Rs. 2,300/Qtl (Market: Rs. 2,380)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB: BOOKING WIZARD */}
            {farmerActiveTab === 'book' && (
              <View style={styles.wizardCard}>
                <Text style={styles.wizardHeaderTitle}>{t.bookSlot}</Text>
                <Text style={styles.wizardHeaderSub}>Step {bookingStep} of 4</Text>

                {bookingStep === 1 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.stepTitle}>{t.selectCentre}</Text>
                    {centresList.map(c => (
                      <TouchableOpacity key={c.id} style={[styles.selectOptionCard, selectedCentre.id === c.id && styles.selectOptionCardActive]} onPress={() => setSelectedCentre(c)}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionName}>{c.name}</Text>
                          <Text style={styles.optionSub}>{c.district}</Text>
                        </View>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#dcfce7', borderRadius: 6, borderWidth: 1, borderColor: '#bbf7d0' }}
                          onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${c.coords || '16.9891,82.2475'}&travelmode=driving`)}
                        >
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#15803d' }}>Directions</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setBookingStep(2)}>
                      <Text style={styles.primaryBtnText}>Next: Select Crop</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {bookingStep === 2 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.stepTitle}>{t.selectCrop}</Text>
                    {cropsList.map(cr => (
                      <TouchableOpacity key={cr.id} style={[styles.selectOptionCard, selectedCrop.id === cr.id && styles.selectOptionCardActive]} onPress={() => setSelectedCrop(cr)}>
                        <Text style={styles.optionName}>{cr.name}</Text>
                        <Text style={styles.optionSub}>MSP Rate: Rs. {cr.msp} / Quintal</Text>
                      </TouchableOpacity>
                    ))}
                    <Text style={styles.inputLabel}>Expected Quantity (Quintals)</Text>
                    <TextInput style={styles.textInput} keyboardType="numeric" value={expectedQty} onChangeText={setExpectedQty} />
                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBookingStep(1)}><Text style={styles.secondaryBtnText}>Back</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => setBookingStep(3)}><Text style={styles.primaryBtnText}>Next: Select Slot</Text></TouchableOpacity>
                    </View>
                  </View>
                )}

                {bookingStep === 3 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.stepTitle}>{t.selectSlot}</Text>
                    {SLOTS.map(sl => (
                      <TouchableOpacity key={sl.id} style={[styles.selectOptionCard, selectedSlot.id === sl.id && styles.selectOptionCardActive]} onPress={() => setSelectedSlot(sl)}>
                        <Text style={styles.optionName}>{sl.time}</Text>
                        <Text style={styles.optionSub}>{sl.reason}</Text>
                      </TouchableOpacity>
                    ))}
                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBookingStep(2)}><Text style={styles.secondaryBtnText}>Back</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => setBookingStep(4)}><Text style={styles.primaryBtnText}>Review Booking</Text></TouchableOpacity>
                    </View>
                  </View>
                )}

                {bookingStep === 4 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.stepTitle}>{t.reviewBooking}</Text>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryRow}>Centre: {selectedCentre.name}</Text>
                      <Text style={styles.summaryRow}>Crop: {selectedCrop.name} ({expectedQty} Qtl)</Text>
                      <Text style={styles.summaryRow}>Date: {bookingDate} ({selectedSlot.time})</Text>
                      <Text style={styles.summaryRow}>Total MSP: Rs. {(parseFloat(expectedQty) || 40) * selectedCrop.msp}</Text>
                    </View>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmBooking}>
                      <Text style={styles.primaryBtnText}>{t.confirmBooking}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* TAB: QR PASS */}
            {farmerActiveTab === 'pass' && activeBooking && (
              <View style={styles.qrPassContainer}>
                <Text style={styles.qrPassHeader}>{t.qrTitle}</Text>
                <View style={styles.realisticQrContainer}>
                  <View style={styles.qrFinderCornerTopLeft}><View style={styles.qrFinderInner} /></View>
                  <View style={styles.qrFinderCornerTopRight}><View style={styles.qrFinderInner} /></View>
                  <View style={styles.qrFinderCornerBottomLeft}><View style={styles.qrFinderInner} /></View>
                  <Text style={styles.qrMatrixPattern}>█▀▀▀▀▀█ ▄█▄█ █▀▀▀▀▀█</Text>
                  <Text style={styles.qrMatrixPattern}>█ ███ █ ▀█▄▀ █ ███ █</Text>
                  <Text style={styles.qrMatrixPattern}>▀▀▀▀▀▀▀ █ █ █ ▀▀▀▀▀▀▀</Text>
                  <View style={styles.qrCenterBadge}><Text style={styles.qrCenterBadgeText}>APMC PASS</Text></View>
                </View>
                <Text style={styles.qrTokenDisplay}>{activeBooking.tokenId}</Text>
                <Text style={styles.instructionsText}>{t.scanInstructions}</Text>
              </View>
            )}

            {/* TAB: PASSBOOK */}
            {farmerActiveTab === 'passbook' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>{t.passbookTitle}</Text>
                <View style={styles.dbtCard}>
                  <Text style={styles.dbtLabel}>NET PROCUREMENT PAYOUT</Text>
                  <Text style={styles.dbtAmount}>Rs. {activeBooking.grossPayout.toLocaleString('en-IN')}</Text>
                  <Text style={styles.dbtRef}>Ref UTR: {activeBooking.paymentReference}</Text>
                </View>
                <View style={styles.bankCard}>
                  <Text style={styles.bankTitle}>Bank: {farmer.bankName}</Text>
                  <Text style={styles.bankRow}>Account: XXXX-XXXX-{farmer.accNo.slice(-4)}</Text>
                  <Text style={styles.bankRow}>Aadhaar DBT: <Text style={styles.greenText}>Verified & Linked</Text></Text>
                </View>
              </View>
            )}

            {/* TAB: PRICES */}
            {farmerActiveTab === 'prices' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>{t.marketPrices}</Text>
                {cropsList.map((p, idx) => (
                  <View key={idx} style={styles.priceRowCard}>
                    <Text style={styles.priceCropName}>{p.name}</Text>
                    <View style={styles.priceGrid}>
                      <View style={styles.priceItem}><Text style={styles.priceLabel}>MSP RATE</Text><Text style={styles.priceValGreen}>Rs. {p.msp}/Qtl</Text></View>
                      <View style={styles.priceItem}><Text style={styles.priceLabel}>MARKET PRICE</Text><Text style={styles.priceValGray}>Rs. {p.marketPrice}/Qtl</Text></View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: GRIEVANCE */}
            {farmerActiveTab === 'grievance' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>{t.grievances}</Text>
                <Text style={styles.inputLabel}>Describe Issue</Text>
                <TextInput style={styles.textArea} multiline numberOfLines={3} value={grievanceDesc} onChangeText={setGrievanceDesc} placeholder="Enter complaint details..." />
                <TouchableOpacity style={styles.primaryBtn} onPress={() => { Alert.alert('Submitted', 'Grievance ticket created.'); setGrievanceDesc(''); }}>
                  <Text style={styles.primaryBtnText}>Submit Ticket</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB: PROFILE */}
            {farmerActiveTab === 'profile' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>FARMER PROFILE</Text>
                <Text style={styles.profileName}>{farmer.name}</Text>
                <Text style={styles.profileId}>{farmer.id}</Text>
                <Text style={styles.profileRow}>Mobile: {farmer.mobile}</Text>
                <Text style={styles.profileRow}>Village: {farmer.village}, {farmer.district}</Text>
                <TouchableOpacity style={styles.logoutBtnFull} onPress={() => setIsAuthenticated(false)}>
                  <Text style={styles.logoutBtnTextFull}>{t.logout}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Farmer Bottom Nav */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => setFarmerActiveTab('home')}><Text style={styles.navText}>Home</Text></TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setBookingStep(1); setFarmerActiveTab('book'); }}><Text style={styles.navText}>Book</Text></TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => setFarmerActiveTab('pass')}><Text style={styles.navText}>Pass</Text></TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => setFarmerActiveTab('passbook')}><Text style={styles.navText}>Passbook</Text></TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => setFarmerActiveTab('prices')}><Text style={styles.navText}>Prices</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* =======================================================================
          PORTAL 2: OPERATOR MANDI PROCUREMENT DESK
         ======================================================================= */}
      {userRole === 'operator' && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Operator Header Bar */}
            <View style={styles.opHeaderRow}>
              <View>
                <Text style={styles.opHeaderTitle}>APMC Mandi Desk (#402)</Text>
                <Text style={styles.opHeaderSub}>Officer: Sai Kumar (APMC-54031) • Guntur, AP</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.opCallBtn} onPress={handleCallNextFarmer}>
                  <Text style={styles.opCallBtnText}>CALL NEXT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.opScanBtn} onPress={() => setShowGateScanModal(true)}>
                  <Text style={styles.opScanBtnText}>GATE QR</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Operator Sub Navigation */}
            <View style={styles.opTabRow}>
              {(['dashboard', 'queue', 'gate', 'procurement', 'farmers', 'payments'] as const).map(tab => (
                <TouchableOpacity key={tab} style={[styles.opTabChip, opActiveTab === tab && styles.opTabChipActive]} onPress={() => setOpActiveTab(tab)}>
                  <Text style={[styles.opTabText, opActiveTab === tab && styles.opTabTextActive]}>{tab.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB: DASHBOARD */}
            {opActiveTab === 'dashboard' && (
              <View>
                {/* 4 KPI Grid */}
                <View style={styles.kpiGrid4}>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>TODAY'S BOOKINGS</Text><Text style={styles.kpiNum}>{queueList.length + 3}</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>WAITING QUEUE</Text><Text style={styles.kpiNum}>{queueList.filter(q => q.status === 'WAITING').length}</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>PROCURED QTL</Text><Text style={styles.kpiNum}>165 Qtl</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>DBT PAYABLE</Text><Text style={styles.kpiNum}>Rs. 3.79 L</Text></View>
                </View>

                {/* Now Serving Panel */}
                <View style={styles.nowServingCard}>
                  <Text style={styles.nowServingHeader}>NOW SERVING AT DESK</Text>
                  {currentServing ? (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.servingToken}>{currentServing.tokenId} — {currentServing.farmerName}</Text>
                      <Text style={styles.servingSub}>{currentServing.crop} • {currentServing.quantityQuintals} Quintals (Est.)</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                        <TouchableOpacity style={styles.workbenchBtn} onPress={() => setShowQualityModal(true)}><Text style={styles.workbenchBtnText}>Lab Assay</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.workbenchBtn} onPress={() => setShowWeighingModal(true)}><Text style={styles.workbenchBtnText}>Weighbridge</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.workbenchBtn, { backgroundColor: '#15803d' }]} onPress={handleCompleteProcurement}><Text style={styles.workbenchBtnText}>Complete & DBT</Text></TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: '#64748b', marginVertical: 10 }}>Desk idle. Click CALL NEXT to serve arriving farmer.</Text>
                  )}
                </View>
              </View>
            )}

            {/* TAB: QUEUE */}
            {opActiveTab === 'queue' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>LIVE MANDI TOKEN QUEUE</Text>
                {queueList.map(q => (
                  <View key={q.tokenId} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#15803d' }}>{q.tokenId} — {q.farmerName}</Text>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>{q.crop} • {q.slot}</Text>
                    </View>
                    <TouchableOpacity style={styles.serveBtnMini} onPress={() => { setCurrentServing(q); setOpActiveTab('dashboard'); }}>
                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>Serve</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: GATE */}
            {opActiveTab === 'gate' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>DIGITAL GATE ENTRY CHECK-IN</Text>
                <Text style={styles.inputLabel}>Enter Gate Pass Token ID</Text>
                <TextInput style={styles.textInput} value={scanToken} onChangeText={setScanToken} placeholder="e.g. PDC-774321" />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleGateScan}>
                  <Text style={styles.primaryBtnText}>Verify & Admit to Mandi Queue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB: PROCUREMENT WORKBENCH */}
            {opActiveTab === 'procurement' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>GOVERNMENT MSP PROCUREMENT WORKBENCH</Text>
                <TouchableOpacity style={[styles.primaryBtn, { marginBottom: 10 }]} onPress={() => setShowQualityModal(true)}>
                  <Text style={styles.primaryBtnText}>1. Run Quality Lab Assay (Moisture ≤ 17.0%)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#0284c7', marginBottom: 10 }]} onPress={() => setShowWeighingModal(true)}>
                  <Text style={styles.primaryBtnText}>2. Record Weighbridge Gross & Tare Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#15803d' }]} onPress={handleCompleteProcurement}>
                  <Text style={styles.primaryBtnText}>3. Execute DBT Transfer & Issue Certificate</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB: FARMERS REGISTRY */}
            {opActiveTab === 'farmers' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>APMC FARMERS REGISTRY</Text>
                <Text style={styles.profileRow}>• Prudhvi Pavan (+91 9125421544) — Aadhaar Verified</Text>
                <Text style={styles.profileRow}>• V. Srinivasa Rao (+91 9848012345) — Aadhaar Verified</Text>
                <Text style={styles.profileRow}>• K. Ramesh (+91 9440156789) — Aadhaar Verified</Text>
              </View>
            )}

            {/* TAB: PAYMENTS */}
            {opActiveTab === 'payments' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>DIRECT BENEFIT TRANSFER (DBT) LEDGER</Text>
                <Text style={styles.profileRow}>• Token PDC-110294: Rs. 1,84,000 Transferred (UTR SBIN0029481)</Text>
                <Text style={styles.profileRow}>• Token PDC-009182: Rs. 4,30,300 Transferred (UTR UBIN0048102)</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* =======================================================================
          PORTAL 3: ADMIN GOVERNANCE PORTAL
         ======================================================================= */}
      {userRole === 'admin' && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={styles.adminHeaderRow}>
              <Text style={styles.adminHeaderTitle}>DoCA Central Admin Governance</Text>
              <Text style={styles.adminHeaderSub}>Ministry of Consumer Affairs, Food & Public Distribution</Text>
            </View>

            {/* Admin Sub Navigation */}
            <View style={styles.opTabRow}>
              {(['dashboard', 'centres', 'operators', 'farmers', 'crops', 'audit'] as const).map(tab => (
                <TouchableOpacity key={tab} style={[styles.opTabChip, adminActiveTab === tab && styles.adminTabChipActive]} onPress={() => setAdminActiveTab(tab)}>
                  <Text style={[styles.opTabText, adminActiveTab === tab && styles.opTabTextActive]}>{tab.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB: DASHBOARD */}
            {adminActiveTab === 'dashboard' && (
              <View>
                <View style={styles.kpiGrid4}>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>REGISTERED FARMERS</Text><Text style={styles.kpiNum}>14,250</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>ACTIVE MANDIS</Text><Text style={styles.kpiNum}>{centresList.length}</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>OPERATORS</Text><Text style={styles.kpiNum}>{operatorsList.length}</Text></View>
                  <View style={styles.kpiBox}><Text style={styles.kpiTitle}>DBT DISBURSED</Text><Text style={styles.kpiNum}>Rs. 19.4 Cr</Text></View>
                </View>

                {/* Capacity Visualizer */}
                <View style={styles.card}>
                  <Text style={styles.cardHeader}>APMC MANDI CAPACITY VS ACTUAL PROCUREMENT</Text>
                  <View style={{ height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10 }}>
                    {[
                      { name: 'Guntur', cap: 100, act: 85 },
                      { name: 'Tenali', cap: 70, act: 50 },
                      { name: 'Godavari', cap: 120, act: 110 }
                    ].map((b, i) => (
                      <View key={i} style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                          <View style={{ width: 14, height: b.cap, backgroundColor: '#0284c7', borderRadius: 2 }} />
                          <View style={{ width: 14, height: b.act, backgroundColor: '#15803d', borderRadius: 2 }} />
                        </View>
                        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{b.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB: CENTRES */}
            {adminActiveTab === 'centres' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>APMC PROCUREMENT CENTRES</Text>
                {centresList.map(c => (
                  <View key={c.id} style={styles.priceRowCard}>
                    <Text style={styles.optionName}>{c.name}</Text>
                    <Text style={styles.optionSub}>{c.id} • District: {c.district}</Text>
                    <Text style={{ fontSize: 11, color: '#15803d', marginTop: 4, fontWeight: 'bold' }}>Daily Quota: {c.dailyQuota} Qtl • {c.activeWeighbridges} Weighbridges</Text>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: OPERATORS */}
            {adminActiveTab === 'operators' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>MANDI OPERATOR CREDENTIALS</Text>
                {operatorsList.map(op => (
                  <View key={op.id} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#0f172a' }}>{op.name} ({op.id})</Text>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>{op.email} • {op.centre}</Text>
                    </View>
                    <TouchableOpacity style={[styles.serveBtnMini, { backgroundColor: op.status === 'Approved' ? '#ef4444' : '#15803d' }]} onPress={() => handleToggleOperatorStatus(op.id)}>
                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>{op.status === 'Approved' ? 'Revoke' : 'Approve'}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: FARMERS */}
            {adminActiveTab === 'farmers' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>NATIONAL FARMERS DATABASE</Text>
                <Text style={styles.profileRow}>• Prudhvi Pavan (FR-AP-2026-000124) — Total Sold: 125 Qtl — DBT Paid: Rs. 2,87,500</Text>
                <Text style={styles.profileRow}>• V. Srinivasa Rao (FMR-20) — Total Sold: 210 Qtl — DBT Paid: Rs. 13,90,200</Text>
              </View>
            )}

            {/* TAB: CROPS & MSP MASTER */}
            {adminActiveTab === 'crops' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>CROP MSP & QUALITY SPECIFICATIONS MASTER</Text>
                {cropsList.map(crop => (
                  <View key={crop.id} style={styles.priceRowCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.optionName}>{crop.name}</Text>
                      <TouchableOpacity style={styles.editPriceBtnMini} onPress={() => { setEditingCrop(crop); setEditMsp(crop.msp); setEditMarketPrice(crop.marketPrice); }}>
                        <Text style={{ color: '#15803d', fontWeight: 'bold', fontSize: 11 }}>Edit Live Price</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 12, color: '#15803d', fontWeight: 'bold', marginTop: 4 }}>Govt MSP Rate: Rs. {crop.msp}/Qtl | Market: Rs. {crop.marketPrice}/Qtl</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Moisture Spec: {crop.moistureLimit}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: AUDIT LOGS */}
            {adminActiveTab === 'audit' && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>IMMUTABLE SYSTEM AUDIT LOGS</Text>
                {auditLogs.map(l => (
                  <View key={l.id} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#273b64' }}>{l.action} ({l.id})</Text>
                    <Text style={{ fontSize: 11, color: '#475569' }}>{l.details}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>User: {l.user} • {l.time}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* MODALS */}
      {/* Quality Assay Modal */}
      <Modal visible={showQualityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quality Lab Assay</Text>
            <Text style={styles.inputLabel}>Moisture Content % (Govt Max ≤ 17.0%)</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={String(moistureVal)} onChangeText={v => setMoistureVal(Number(v))} />
            <Text style={styles.inputLabel}>Foreign Matter %</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={String(foreignVal)} onChangeText={v => setForeignVal(Number(v))} />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveAssay}>
              <Text style={styles.primaryBtnText}>Certify Grade A & Forward to Weighbridge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowQualityModal(false)}><Text style={styles.closeModalText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Weighbridge Modal */}
      <Modal visible={showWeighingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Electronic Weighbridge</Text>
            <Text style={styles.inputLabel}>Gross Weight (kg)</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={String(grossVal)} onChangeText={v => setGrossVal(Number(v))} />
            <Text style={styles.inputLabel}>Tare Weight (kg)</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={String(tareVal)} onChangeText={v => setTareVal(Number(v))} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#15803d', marginVertical: 10 }}>Net Produce: {((grossVal - tareVal) / 100).toFixed(2)} Quintals</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmWeighing}>
              <Text style={styles.primaryBtnText}>Confirm Net Produce Weight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowWeighingModal(false)}><Text style={styles.closeModalText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal visible={showPrintReceipt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DoCA Procurement Certificate</Text>
            {receiptData && (
              <View style={{ marginVertical: 10 }}>
                <Text style={styles.summaryRow}>Cert No: {receiptData.certNo}</Text>
                <Text style={styles.summaryRow}>Farmer: {receiptData.farmerName}</Text>
                <Text style={styles.summaryRow}>Crop: {receiptData.crop}</Text>
                <Text style={styles.summaryRow}>Net Qtl: {receiptData.netQuintals} Quintals</Text>
                <Text style={styles.payoutHighlight}>Total Payout: Rs. {receiptData.totalPayout.toLocaleString('en-IN')}</Text>
                <Text style={{ fontSize: 11, color: '#15803d', fontWeight: 'bold', marginTop: 6 }}>DBT Transfer Executed to Aadhaar Bank A/C</Text>
              </View>
            )}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowPrintReceipt(false)}><Text style={styles.primaryBtnText}>Done & Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Admin Edit Price Modal */}
      <Modal visible={!!editingCrop} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Crop Market Rates</Text>
            {editingCrop && (
              <View>
                <Text style={styles.inputLabel}>Govt MSP Rate (Rs./Quintal)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={String(editMsp)} onChangeText={v => setEditMsp(Number(v))} />
                <Text style={styles.inputLabel}>Market Price (Rs./Quintal)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={String(editMarketPrice)} onChangeText={v => setEditMarketPrice(Number(v))} />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveCropPrice}>
                  <Text style={styles.primaryBtnText}>Save & Publish Live</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setEditingCrop(null)}><Text style={styles.closeModalText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Operator Gate Scanner Modal */}
      <Modal visible={showGateScanModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gate Pass Scanner</Text>
            <Text style={styles.inputLabel}>Scan or Enter Token ID</Text>
            <TextInput style={styles.textInput} value={scanToken} onChangeText={setScanToken} placeholder="e.g. PDC-774321" />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleGateScan}>
              <Text style={styles.primaryBtnText}>Admit Farmer to Mandi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowGateScanModal(false)}><Text style={styles.closeModalText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLESHEET
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#f8fafc' },
  authContainer: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0f172a' },
  topMasterBar: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleSwitcherHeaderRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  miniRoleBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f1f5f9' },
  miniRoleBtnActive: { backgroundColor: '#15803d' },
  miniRoleText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  miniRoleTextActive: { color: '#ffffff' },
  signOutBtnMini: { paddingHorizontal: 6, paddingVertical: 4 },
  authHeaderBanner: { alignItems: 'center', marginBottom: 20 },
  authGovBadge: { fontSize: 11, color: '#48bb78', fontWeight: 'bold', marginBottom: 4 },
  authHeaderTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  authHeaderSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 2 },
  rolePickerBox: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 16 },
  rolePickerLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginBottom: 8 },
  rolePickerRow: { flexDirection: 'row', gap: 8 },
  roleTabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  roleTabBtnFarmer: { backgroundColor: '#15803d' },
  roleTabBtnOp: { backgroundColor: '#16a34a' },
  roleTabBtnAdmin: { backgroundColor: '#273b64' },
  roleTabText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  roleTabTextActive: { color: '#ffffff' },
  authCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20 },
  authCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  authCardSub: { fontSize: 12, color: '#64748b', marginBottom: 14 },
  demoLoginBtn: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 14 },
  demoLoginBtnText: { color: '#15803d', fontWeight: 'bold', fontSize: 13 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 6, marginTop: 10 },
  phoneInputWrap: { flexDirection: 'row', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, overflow: 'hidden' },
  countryCode: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 12, fontWeight: 'bold', color: '#0f172a' },
  phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 16, color: '#0f172a' },
  otpInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  textInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 14, color: '#0f172a' },
  primaryBtn: { backgroundColor: '#15803d', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  primaryBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondaryBtnText: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },
  welcomeBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  greetingTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  greetingSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  voiceBtn: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  voiceBtnText: { color: '#15803d', fontWeight: 'bold', fontSize: 12 },
  langSelectBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  langSelectBtnText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },
  activeCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#cbd5e1' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeCardTag: { fontSize: 11, fontWeight: 'bold', color: '#15803d' },
  tokenBadge: { backgroundColor: '#15803d', color: '#ffffff', fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  cropTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  centreSub: { fontSize: 12, color: '#475569', marginTop: 2 },
  slotSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  statsMatrix: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  statValHighlight: { fontSize: 15, fontWeight: 'bold', color: '#15803d', marginTop: 2 },
  pipelineCard: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 10, marginTop: 12 },
  pipelineTitle: { fontSize: 11, fontWeight: 'bold', color: '#166534', marginBottom: 6 },
  stageProgressTrack: { flexDirection: 'row', justifyContent: 'space-between' },
  stageStepItem: { alignItems: 'center' },
  stepDot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: '#15803d' },
  stepDotPending: { backgroundColor: '#cbd5e1' },
  stepNum: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
  stepText: { fontSize: 8, color: '#475569', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  passBtn: { flex: 1, backgroundColor: '#15803d', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  passBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  rescheduleBtn: { flex: 1, backgroundColor: '#273b64', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  rescheduleBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  priceOverviewCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  priceHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  priceCropRow: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },
  wizardCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16 },
  wizardHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  wizardHeaderSub: { fontSize: 11, color: '#64748b' },
  stepTitle: { fontSize: 13, fontWeight: 'bold', color: '#15803d', marginBottom: 8 },
  selectOptionCard: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  selectOptionCardActive: { backgroundColor: '#f0fdf4', borderColor: '#15803d', borderWidth: 2 },
  optionName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  optionSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  summaryBox: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, marginVertical: 10 },
  summaryRow: { fontSize: 12, color: '#475569', marginBottom: 4 },
  payoutHighlight: { fontWeight: 'bold', color: '#15803d', fontSize: 15 },
  qrPassContainer: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, alignItems: 'center' },
  qrPassHeader: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  realisticQrContainer: { width: 180, height: 180, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 3, borderColor: '#15803d', padding: 12, alignItems: 'center', justifyContent: 'center', position: 'relative', marginVertical: 12 },
  qrFinderCornerTopLeft: { position: 'absolute', top: 10, left: 10, width: 30, height: 30, borderWidth: 3, borderColor: '#0f172a', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qrFinderCornerTopRight: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderWidth: 3, borderColor: '#0f172a', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qrFinderCornerBottomLeft: { position: 'absolute', bottom: 10, left: 10, width: 30, height: 30, borderWidth: 3, borderColor: '#0f172a', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qrFinderInner: { width: 12, height: 12, backgroundColor: '#15803d', borderRadius: 2 },
  qrMatrixPattern: { fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#0f172a', letterSpacing: 1 },
  qrCenterBadge: { position: 'absolute', backgroundColor: '#15803d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  qrCenterBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: 'bold' },
  qrTokenDisplay: { fontSize: 16, fontWeight: 'bold', color: '#15803d' },
  instructionsText: { fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14 },
  cardHeader: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  dbtCard: { backgroundColor: '#f0fdf4', padding: 14, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#15803d' },
  dbtLabel: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  dbtAmount: { fontSize: 24, fontWeight: 'bold', color: '#15803d', marginTop: 2 },
  dbtRef: { fontSize: 11, color: '#64748b', marginTop: 4 },
  bankCard: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10 },
  bankTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  bankRow: { fontSize: 11, color: '#475569', marginBottom: 2 },
  greenText: { color: '#15803d', fontWeight: 'bold' },
  priceRowCard: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 8 },
  priceCropName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  priceGrid: { flexDirection: 'row', gap: 10, marginVertical: 4 },
  priceItem: { flex: 1 },
  priceLabel: { fontSize: 9, color: '#64748b', fontWeight: 'bold' },
  priceValGreen: { fontSize: 13, fontWeight: 'bold', color: '#15803d' },
  priceValGray: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  textArea: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 13, color: '#0f172a', height: 70 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  profileId: { fontSize: 12, color: '#15803d', fontWeight: 'bold', marginBottom: 8 },
  profileRow: { fontSize: 12, color: '#475569', marginBottom: 4 },
  logoutBtnFull: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  logoutBtnTextFull: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
  bottomNav: { flexDirection: 'row', height: 56, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  opHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  opHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  opHeaderSub: { fontSize: 11, color: '#64748b' },
  opCallBtn: { backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  opCallBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  opScanBtn: { backgroundColor: '#0284c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  opScanBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  opTabRow: { flexDirection: 'row', gap: 4, marginBottom: 12, flexWrap: 'wrap' },
  opTabChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f1f5f9' },
  opTabChipActive: { backgroundColor: '#15803d' },
  adminTabChipActive: { backgroundColor: '#273b64' },
  opTabText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  opTabTextActive: { color: '#ffffff' },
  kpiGrid4: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiBox: { flex: 1, backgroundColor: '#ffffff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  kpiTitle: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  kpiNum: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  nowServingCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#bbf7d0', borderLeftWidth: 4, borderLeftColor: '#15803d' },
  nowServingHeader: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  servingToken: { fontSize: 16, fontWeight: 'bold', color: '#15803d', marginTop: 2 },
  servingSub: { fontSize: 12, color: '#475569' },
  workbenchBtn: { flex: 1, backgroundColor: '#0284c7', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  workbenchBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  serveBtnMini: { backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  adminHeaderRow: { marginBottom: 10 },
  adminHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  adminHeaderSub: { fontSize: 11, color: '#64748b' },
  editPriceBtnMini: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  closeModalBtn: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  closeModalText: { color: '#0f172a', fontWeight: 'bold' }
});
