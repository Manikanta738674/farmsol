import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { translations, Language } from './i18n/translations';
import { QRCodeCanvas } from './components/QRCodeCanvas';
import { FarmSolLogo } from './components/FarmSolLogo';

const getHost = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

const API_BASE = `http://${getHost()}:5000/api/v1`;

interface ActiveBooking {
  bookingId: string;
  tokenId: string;
  farmerId: string;
  centreName: string;
  cropName: string;
  bookingDate: string;
  timeWindow: string;
  expectedQuantityQuintals: number;
  status: string;
  currentStage: 'GATE_ENTRY' | 'WAITING' | 'QUALITY' | 'WEIGHING' | 'COMPLETED';
  qrPayload: string;
  farmersAhead: number;
  estimatedWaitMinutes: number;
  currentServedToken: string | null;
  mspRate: number;
  estimatedPayout: number;
}

export default function App() {
  // Authentication & RBAC State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'farmer' | 'operator' | 'admin'>('farmer');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [farmerMobile, setFarmerMobile] = useState<string>('9125421544');
  const [emailInput, setEmailInput] = useState<string>('saikumar448470@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('Pavan@2026Secure!');
  const [otpValues, setOtpValues] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [recentProcurements, setRecentProcurements] = useState<any[]>([
    { procurementId: 'RCP-2026-9041', date: '01 Sep 2026', crop: 'Paddy (Grade A)', netWeightQuintals: 45.0, ratePerQuintal: 2300, totalAmount: 103500, status: 'SUCCESS' },
    { procurementId: 'RCP-2026-8812', date: '24 Aug 2026', crop: 'Paddy (Common)', netWeightQuintals: 30.0, ratePerQuintal: 2183, totalAmount: 65490, status: 'SUCCESS' }
  ]);

  // Check URL params for logout signal from Operator or Admin portals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === 'true' || params.get('auth') === 'true') {
      setIsAuthenticated(false);
      setAuthMode('signup');
      localStorage.removeItem('smartfarmer_session');
    }
  }, []);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setAuthMode('signup');
    localStorage.removeItem('smartfarmer_session');
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // -------------------------------------------------------------
  // FARMER MODULE STATE (SRS SIH26032)
  // -------------------------------------------------------------
  const [lang, setLang] = useState<Language>('te');
  const t = translations[lang] || translations.en;
  const [farmerActiveTab, setFarmerActiveTab] = useState<string>('dashboard');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMobileFrameView, setIsMobileFrameView] = useState<boolean>(true);

  const [farmer, setFarmer] = useState<any>({
    id: 'FR-AP-2026-000124',
    name: 'Prudhvi Pavan',
    mobile: '+91 9125421544',
    district: 'Kakinada, East Godavari',
    state: 'Andhra Pradesh',
    landArea: '4.5 Acres (Verified)',
    crops: 'Paddy (Grade A), Cotton',
    bankAccount: 'State Bank of India (A/C: ****5512)',
    ifsc: 'SBIN0001234'
  });

  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>({
    bookingId: 'BK-2026-000845',
    tokenId: 'PDC-774321',
    farmerId: 'FMR-19',
    centreName: 'Sri Lakshmi Procurement Centre',
    cropName: 'Paddy (Grade A) (45 Qtl)',
    bookingDate: '02/09/2026',
    timeWindow: '09:00 AM - 11:00 AM',
    expectedQuantityQuintals: 45,
    status: 'CONFIRMED',
    currentStage: 'WAITING',
    qrPayload: JSON.stringify({
      type: 'APMC_GATE_PASS',
      tokenId: 'PDC-774321',
      farmerId: 'FMR-19',
      crop: 'Paddy (Grade A)',
      qty: 45,
      centre: 'PC-AP-VZM-0012',
      date: '2026-09-02'
    }),
    farmersAhead: 1,
    estimatedWaitMinutes: 12,
    currentServedToken: 'PDC-A004',
    mspRate: 2300,
    estimatedPayout: 103500
  });

  // Booking Wizard
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('CR-PADDY-GRADE-A');
  const [selectedQty, setSelectedQty] = useState<number>(45);
  const [selectedCentre, setSelectedCentre] = useState<string>('PC-AP-VZM-0012');
  const [preferredDate, setPreferredDate] = useState<string>('2026-09-02');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('SLOT-09-11');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00 AM - 11:00 AM');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);

  // Bank & DBT
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: 'Prudhvi',
    bankName: 'State Bank of India',
    accountNumber: '392810482910',
    confirmAccountNumber: '392810482910',
    ifscCode: 'SBIN0001234'
  });

  // Profile & GPS Location State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editFarmerData, setEditFarmerData] = useState({
    name: farmer.name || 'Prudhvi Pavan',
    mobile: farmer.mobile || '+91 9125421544',
    district: farmer.district || 'Kakinada, East Godavari',
    state: farmer.state || 'Andhra Pradesh',
    landArea: farmer.landArea || '4.5 Acres (Verified)',
    crops: farmer.crops || 'Paddy (Grade A), Cotton'
  });
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsNearestStatus, setGpsNearestStatus] = useState<string>('');

  // Reschedule & Cancel Modals
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [rescheduleReason, setRescheduleReason] = useState<string>('WEATHER_ISSUES');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('09:00 AM - 11:00 AM');
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('TRANSPORT_DELAY');
  const [showGrievanceModal, setShowGrievanceModal] = useState<boolean>(false);
  const [grievanceText, setGrievanceText] = useState<string>('');
  const [grievanceCategory, setGrievanceCategory] = useState<string>('QUALITY_DISPUTE');

  // Master Bookings List for Farmer (Place, Timings, Crop, Quantity)
  const [myBookingsList, setMyBookingsList] = useState<any[]>([
    {
      bookingId: 'BK-2026-000845',
      tokenId: 'PDC-774321',
      cropName: 'Paddy (Grade A)',
      expectedQuantityQuintals: 45.0,
      centreName: 'Sri Lakshmi Procurement Centre #402',
      centreDistrict: 'West Godavari, AP',
      bookingDate: '02 Sep 2026',
      timeWindow: '09:00 AM - 11:00 AM',
      status: 'CONFIRMED',
      currentStage: 'QUALITY',
      farmersAhead: 1,
      estimatedWaitMinutes: 12,
      mspRate: 2300,
      estimatedPayout: 103500,
      qrPayload: JSON.stringify({ tokenId: 'PDC-774321', farmer: 'FMR-19', crop: 'Paddy Grade A' })
    },
    {
      bookingId: 'BK-2026-000789',
      tokenId: 'PDC-654120',
      cropName: 'Paddy (Common)',
      expectedQuantityQuintals: 30.0,
      centreName: 'Godavari Green Mandi #201',
      centreDistrict: 'East Godavari, AP',
      bookingDate: '24 Aug 2026',
      timeWindow: '11:00 AM - 01:00 PM',
      status: 'COMPLETED',
      currentStage: 'COMPLETED',
      farmersAhead: 0,
      estimatedWaitMinutes: 0,
      mspRate: 2183,
      estimatedPayout: 65490,
      qrPayload: JSON.stringify({ tokenId: 'PDC-654120', farmer: 'FMR-19', crop: 'Paddy Common' })
    },
    {
      bookingId: 'BK-2026-000620',
      tokenId: 'PDC-541299',
      cropName: 'Cotton (Medium Staple)',
      expectedQuantityQuintals: 20.0,
      centreName: 'AMC Guntur Central #402',
      centreDistrict: 'Guntur, AP',
      bookingDate: '15 Aug 2026',
      timeWindow: '02:00 PM - 04:00 PM',
      status: 'COMPLETED',
      currentStage: 'COMPLETED',
      farmersAhead: 0,
      estimatedWaitMinutes: 0,
      mspRate: 6620,
      estimatedPayout: 132400,
      qrPayload: JSON.stringify({ tokenId: 'PDC-541299', farmer: 'FMR-19', crop: 'Cotton' })
    }
  ]);

  // Master Crops & Dynamic Market Rates (DoCA 2026 Guaranteed MSP)
  const [cropsList, setCropsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('smartfarmer_crop_rates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          cropId: c.id || c.cropId,
          name: c.name,
          mspRatePerQuintal: c.msp,
          marketPricePerQuintal: c.marketPrice || c.msp + 80,
          season: c.season || 'Kharif 2026',
          icon: c.name.includes('Cotton') ? '' : c.name.includes('Wheat') ? '' : '',
          lastUpdated: c.lastUpdated || 'Live'
        }));
      } catch (e) {}
    }
    return [
      { cropId: 'CR-PADDY-GRADE-A', key: 'cropPaddyGradeA', name: 'Paddy (Grade A)', mspRatePerQuintal: 2300, marketPricePerQuintal: 2380, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-PADDY-COMMON', key: 'cropPaddyCommon', name: 'Paddy (Common)', mspRatePerQuintal: 2183, marketPricePerQuintal: 2240, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-COTTON-MEDIUM', key: 'cropCottonMedium', name: 'Cotton (Medium Staple)', mspRatePerQuintal: 6620, marketPricePerQuintal: 6750, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-COTTON-LONG', key: 'cropCottonLong', name: 'Cotton (Long Staple)', mspRatePerQuintal: 7020, marketPricePerQuintal: 7150, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-WHEAT', key: 'cropWheatSharbati', name: 'Wheat (Sharbati)', mspRatePerQuintal: 2275, marketPricePerQuintal: 2340, season: 'Rabi 2026', lastUpdated: 'Live' },
      { cropId: 'CR-MAIZE', key: 'cropMaizeKharif', name: 'Maize (Kharif)', mspRatePerQuintal: 2090, marketPricePerQuintal: 2150, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-RED-GRAM', key: 'cropRedGramTur', name: 'Red Gram (Arhar/Tur)', mspRatePerQuintal: 7000, marketPricePerQuintal: 7180, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-BENGAL-GRAM', key: 'cropBengalGramChana', name: 'Bengal Gram (Chana)', mspRatePerQuintal: 5440, marketPricePerQuintal: 5580, season: 'Rabi 2026', lastUpdated: 'Live' },
      { cropId: 'CR-BLACK-GRAM', key: 'cropBlackGramUrad', name: 'Black Gram (Urad)', mspRatePerQuintal: 6950, marketPricePerQuintal: 7100, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-GREEN-GRAM', key: 'cropGreenGramMoong', name: 'Green Gram (Moong)', mspRatePerQuintal: 8558, marketPricePerQuintal: 8700, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-GROUNDNUT', key: 'cropGroundnut', name: 'Groundnut (Peanut)', mspRatePerQuintal: 6377, marketPricePerQuintal: 6500, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-SOYBEAN', key: 'cropSoybean', name: 'Soybean (Yellow)', mspRatePerQuintal: 4600, marketPricePerQuintal: 4720, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-SUNFLOWER', key: 'cropSunflower', name: 'Sunflower Seeds', mspRatePerQuintal: 6760, marketPricePerQuintal: 6890, season: 'Kharif 2026', lastUpdated: 'Live' },
      { cropId: 'CR-SUGARCANE', key: 'cropSugarcane', name: 'Sugarcane', mspRatePerQuintal: 315, marketPricePerQuintal: 335, season: 'Annual 2026', lastUpdated: 'Live' },
      { cropId: 'CR-RED-CHILLI', key: 'cropRedChilli', name: 'Red Chilli (Spices)', mspRatePerQuintal: 12500, marketPricePerQuintal: 12900, season: 'Rabi 2026', lastUpdated: 'Live' }
    ];
  });

  // Helper to translate crop names based on active language
  const getCropTitle = (cropNameOrKey: string) => {
    const cropObj = cropsList.find((c) => c.name === cropNameOrKey || c.cropId === cropNameOrKey || c.key === cropNameOrKey);
    if (cropObj && cropObj.key && (t as any)[cropObj.key]) {
      return (t as any)[cropObj.key];
    }
    return cropNameOrKey;
  };

  // Listen to live rate updates from Admin
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('smartfarmer_crop_rates');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCropsList(parsed.map((c: any) => ({
            cropId: c.id || c.cropId,
            key: c.key || 'cropPaddyGradeA',
            name: c.name,
            mspRatePerQuintal: c.msp,
            marketPricePerQuintal: c.marketPrice || c.msp + 80,
            season: c.season || 'Kharif 2026',
            icon: '',
            lastUpdated: c.lastUpdated || 'Live'
          })));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [centresList] = useState<any[]>([
    { centreId: 'PC-AP-KKD-0402', name: 'Sri Lakshmi APMC Procurement Centre #402', district: 'Kakinada, East Godavari', distanceKm: 4.2, coords: '16.9891,82.2475', address: 'Kakinada APMC Market Road, NH-16', contact: '+91 98480 11223', hours: '08:00 AM - 06:00 PM' },
    { centreId: 'PC-AP-RJY-0201', name: 'Godavari Green Mandi Kendra #201', district: 'Rajahmundry, East Godavari', distanceKm: 8.5, coords: '17.0005,81.7799', address: 'Rajahmundry Rythu Bazar Yard', contact: '+91 98480 44556', hours: '08:00 AM - 06:00 PM' },
    { centreId: 'PC-AP-GNT-0305', name: 'AMC Central APMC Market Yard #305', district: 'Guntur, Andhra Pradesh', distanceKm: 14.1, coords: '16.3067,80.4365', address: 'Guntur Chilli Market Yard Highway', contact: '+91 94401 88990', hours: '07:30 AM - 06:30 PM' },
    { centreId: 'PC-AP-VSKP-0108', name: 'Visakha Kisan Seva Mandi #108', district: 'Visakhapatnam, Andhra Pradesh', distanceKm: 18.3, coords: '17.6868,83.2185', address: 'Anakapalle Jaggery & Grain APMC', contact: '+91 94401 22334', hours: '08:00 AM - 05:30 PM' },
    { centreId: 'PC-AP-VJA-0504', name: 'Krishna Delta APMC Kendra #504', district: 'Vijayawada, Andhra Pradesh', distanceKm: 22.0, coords: '16.5062,80.6480', address: 'Auto Nagar Grain Yard, Vijayawada', contact: '+91 91254 77889', hours: '08:00 AM - 06:00 PM' }
  ]);

  // Notifications & SMS Logs (Feature 8 & 13)
  const [notificationsList, setNotificationsList] = useState<any[]>([
    {
      id: 'NOTIF-005',
      title: 'Procurement Day Alert & Mandi Directions',
      message: 'Today is your scheduled slot at Sri Lakshmi APMC Centre #402. Tap for live Google Maps directions to Gate #1.',
      channel: 'APP + SMS LOG',
      time: 'Just now',
      type: 'DIRECTIONS_ALERT'
    },
    {
      id: 'NOTIF-004',
      title: 'DBT Payment Disbursed',
      message: '₹1,03,500 has been credited to your SBI Account (A/C ****5512). UTR Ref: UTR-20260902-88192.',
      channel: 'APP + SMS',
      time: '10 mins ago',
      type: 'PAYMENT'
    },
    {
      id: 'NOTIF-003',
      title: 'Market Price Alert',
      message: 'Paddy Grade A mandi price updated to ₹2,380/Qtl (+₹80 above MSP).',
      channel: 'SMS LOG',
      time: '1 hour ago',
      type: 'PRICE_ALERT'
    },
    {
      id: 'NOTIF-002',
      title: 'Gate Pass Token Confirmed',
      message: 'Slot reserved for 02 Sep 2026 (09:00 AM - 11:00 AM) at Sri Lakshmi Centre #402. Token ID: PDC-774321.',
      channel: 'APP + SMS',
      time: '3 hours ago',
      type: 'BOOKING'
    },
    {
      id: 'NOTIF-001',
      title: 'APMC Mandi Announcement',
      message: 'Moisture limit threshold for Paddy Grade A is strictly capped at ≤ 17.0%. Please dry grains before arrival.',
      channel: 'ANNOUNCEMENT',
      time: 'Yesterday',
      type: 'GOVT'
    }
  ]);

  // Important Govt & Mandi Announcements (Feature 14)
  const [announcementsList] = useState<any[]>([
    {
      id: 'ANN-101',
      title: 'Paddy Procurement Season 2026 Guidelines',
      content: 'Ministry of Consumer Affairs, Food & Public Distribution announces 100% MSP guarantee for Grade A Paddy at ₹2,300/Qtl.',
      date: '01 Sep 2026',
      tag: 'Official Policy'
    },
    {
      id: 'ANN-102',
      title: 'Weather Advisory for East Godavari Farmers',
      content: 'Clear sunny weather expected over the next 4 days. Ideal conditions for harvesting and grain drying.',
      date: '31 Aug 2026',
      tag: 'Weather'
    }
  ]);

  // Feedback State (Feature 15)
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // -------------------------------------------------------------
  // OPERATOR MODULE STATE (PAGE 10 OF PDF)
  // -------------------------------------------------------------
  const [opActiveTab, setOpActiveTab] = useState<string>('dashboard');
  const [opFilter, setOpFilter] = useState<string>('all');
  const [currentServing, setCurrentServing] = useState<any>({
    tokenId: 'PDC-774321',
    farmerName: 'Prudhvi',
    crop: 'Paddy (Grade A)',
    quantityQuintals: 45,
    stage: 'QUALITY',
    arrivedAt: '09:05 AM',
    vehicleNo: 'AP-39-TX-8819',
    mspRate: 2300
  });
  const [queueList, setQueueList] = useState<any[]>([
    {
      tokenId: 'PDC-F51B1E',
      farmerName: 'V. Srinivasa Rao',
      crop: 'Cotton (70 Qtl)',
      quantityQuintals: 70,
      slot: '09:00 AM - 11:00 AM',
      status: 'WAITING',
      stage: 'WAITING',
      mspRate: 6620
    },
    {
      tokenId: 'PDC-384591',
      farmerName: 'K. Ramesh',
      crop: 'Paddy (Common)',
      quantityQuintals: 50,
      slot: '11:00 AM - 01:00 PM',
      status: 'BOOKED',
      stage: 'BOOKED',
      mspRate: 2183
    }
  ]);
  const [showGateScanModal, setShowGateScanModal] = useState<boolean>(false);
  const [scanInputToken, setScanInputToken] = useState<string>('PDC-774321');
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [moisture, setMoisture] = useState<number>(14.2);
  const [foreignMatter, setForeignMatter] = useState<number>(1.1);
  const [qualityGrade, setQualityGrade] = useState<string>('GRADE_A');
  const [showWeighingModal, setShowWeighingModal] = useState<boolean>(false);
  const [grossWeight, setGrossWeight] = useState<number>(7250);
  const [tareWeight, setTareWeight] = useState<number>(2750);

  // -------------------------------------------------------------
  // ADMIN MODULE STATE (PAGE 12 OF PDF)
  // -------------------------------------------------------------
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [operatorsList, setOperatorsList] = useState<any[]>([
    { id: 'APMC-54031', centre: 'Sri Lakshmi Procurement Centre', email: 'saikumar448470@gmail.com', verified: 'Unverified', status: 'Approved' },
    { id: 'APMC-0342', centre: 'Godavari Green Center', email: 'pavansurya9902@gmail.com', verified: 'Unverified', status: 'Approved' },
    { id: 'OP-103', centre: 'Kisan Seva Kendra APMC', email: 'operator.guntur@apmc.gov.in', verified: 'Unverified', status: 'Pending Approval' }
  ]);
  const [auditLogs] = useState<any[]>([
    { id: 'AUD-901', action: 'SLOT_RESCHEDULED', user: 'Farmer FMR-19', reason: 'Rain / Weather Conditions', time: '10 mins ago' },
    { id: 'AUD-900', action: 'GATE_ENTRY_CHECKIN', user: 'Operator APMC-54031', reason: 'Scanned digital QR Gate Pass for Token PDC-774321', time: '25 mins ago' }
  ]);

  // Auth Handler for Login
  const handleLoginSubmit = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setIsAuthenticated(true);
    }, 400);
  };

  // Enhanced Multi-Lingual Voice Assistance
  const handleVoiceReadout = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const currentStageName = (t as any)[activeBooking?.currentStage || 'WAITING'] || activeBooking?.currentStage || 'Waiting Lounge';
    let voiceText = '';

    if (lang === 'te') {
      voiceText = `నమస్కారం ${farmer?.name} గారూ. మీ యాక్టివ్ టోకెన్ నంబర్ ${activeBooking?.tokenId}. పంట ${activeBooking?.cropName}, పరిమాణం ${activeBooking?.expectedQuantityQuintals} క్వింటాళ్లు. మీ ప్రస్తుత దశ ${currentStageName}. సుమారు వేచి ఉండే సమయం ${activeBooking?.estimatedWaitMinutes} నిమిషాలు. మీ ముందు ${activeBooking?.farmersAhead} మంది రైతులు ఉన్నారు. కేంద్రం ${activeBooking?.centreName}.`;
    } else if (lang === 'hi') {
      voiceText = `नमस्ते ${farmer?.name} जी। आपका सक्रिय टोकन नंबर ${activeBooking?.tokenId} है। फसल ${activeBooking?.cropName}, मात्रा ${activeBooking?.expectedQuantityQuintals} क्विंटल है। वर्तमान चरण ${currentStageName} है। अनुमानित प्रतीक्षा समय ${activeBooking?.estimatedWaitMinutes} मिनट है। आपके आगे ${activeBooking?.farmersAhead} किसान हैं। खरीद केंद्र ${activeBooking?.centreName}।`;
    } else {
      voiceText = `Hello ${farmer?.name}. Your active slot token is ${activeBooking?.tokenId}. Crop is ${activeBooking?.cropName}, quantity ${activeBooking?.expectedQuantityQuintals} quintals. Current stage is ${currentStageName}. Estimated waiting time is ${activeBooking?.estimatedWaitMinutes} minutes with ${activeBooking?.farmersAhead} farmers ahead of you at ${activeBooking?.centreName}.`;
    }

    const utterance = new SpeechSynthesisUtterance(voiceText);
    const targetLangCode = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLangCode;
    utterance.rate = 0.88;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === targetLangCode || v.lang.startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // =============================================================
  // RENDER RBAC AUTH LOGIN (EXACT MATCH OF SCREENSHOTS)
  // =============================================================
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FarmSolLogo size="md" showTagline={true} />
            <div className="auth-badge" style={{ marginTop: 14 }}>
              NATIONAL AGRICULTURAL ACCESS PORTAL
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.35rem', marginTop: 4 }}>Smart Procure</h1>
            <p className="auth-subtitle">From Farm to Market, Made Smarter.</p>
          </div>

          {/* Main Sign In / Register Tabs */}
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
              Sign Up / Register
            </button>
          </div>

          {/* Role Switcher Label & Buttons */}
          <div className="role-label">SIGN IN AS</div>
          <div className="role-selector">
            <button
              className={`role-btn ${userRole === 'farmer' ? 'active-farmer' : ''}`}
              onClick={() => { setUserRole('farmer'); setIsAuthenticated(false); }}
            >
              Farmer
            </button>
            <button
              className={`role-btn ${userRole === 'operator' ? 'active-operator' : ''}`}
              onClick={() => { setUserRole('operator'); setIsAuthenticated(false); }}
            >
              Operator
            </button>
            <button
              className={`role-btn ${userRole === 'admin' ? 'active-admin' : ''}`}
              onClick={() => { setUserRole('admin'); setIsAuthenticated(false); }}
            >
              Admin
            </button>
          </div>

          {/* Role: FARMER (Phone + OTP) */}
          {userRole === 'farmer' && (
            <div>
              {!otpSent ? (
                <div>
                  <label className="form-label-auth">
                    Mobile Number <span>*</span>
                  </label>
                  <div className="phone-input-group">
                    <div className="country-code">
                      +91
                    </div>
                    <input
                      type="tel"
                      className="phone-input-field"
                      value={farmerMobile}
                      onChange={(e) => setFarmerMobile(e.target.value)}
                      placeholder="Enter 10 digit mobile"
                      maxLength={10}
                    />
                  </div>
                  <button
                    className="btn-login-green"
                    style={{ marginTop: 20 }}
                    onClick={() => setOtpSent(true)}
                    disabled={farmerMobile.length < 10}
                  >
                    Send OTP
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    OTP sent successfully to +91 *******{farmerMobile.slice(-3)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                    <label className="form-label-auth" style={{ margin: 0 }}>
                      Enter OTP
                    </label>
                    <span
                      style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => setOtpSent(false)}
                    >
                      Change Number
                    </span>
                  </div>

                  <div className="otp-box-group">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        className="otp-input"
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => {
                          const newVals = [...otpValues];
                          newVals[idx] = e.target.value;
                          setOtpValues(newVals);
                          if (e.target.value && idx < 5) {
                            document.getElementById(`otp-${idx + 1}`)?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>

                  <button className="btn-login-green" onClick={handleLoginSubmit}>
                    {authLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Role: OPERATOR (Email + Password + Password Strength) */}
          {userRole === 'operator' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label-auth">
                  Email Address <span>*</span>
                </label>
                <input
                  type="email"
                  className="input-box-auth"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@apmc.gov.in"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label-auth">
                  Password <span>*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-box-auth"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Password Strength Box */}
              <div className="password-strength-box">
                <div className="strength-header">
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <span style={{ color: '#16a34a' }}>VERY STRONG</span>
                </div>
                <div className="strength-bars">
                  <div className="strength-bar-fill"></div>
                </div>
                <div className="strength-checklist">
                  <span>✓ 8+ chars</span>
                  <span>✓ Upper & lower</span>
                  <span>✓ Number (0-9)</span>
                  <span>✓ Symbol (@#$)</span>
                </div>
              </div>

              {/* Notice Pill */}
              <div className="auth-notice-pill">
                <span>Procurement Operator accounts require verified SMTP email credentials.</span>
              </div>

              <button className="btn-login-green" onClick={handleLoginSubmit}>
                {authLoading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          )}

          {/* Role: ADMIN (Email + Password + Admin Encrypted Gateway) */}
          {userRole === 'admin' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label-auth">
                  Email Address <span>*</span>
                </label>
                <input
                  type="email"
                  className="input-box-auth"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@doca.gov.in"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label-auth">
                  Password <span>*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-box-auth"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Password Strength Box */}
              <div className="password-strength-box">
                <div className="strength-header">
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <span style={{ color: '#16a34a' }}>VERY STRONG</span>
                </div>
                <div className="strength-bars">
                  <div className="strength-bar-fill"></div>
                </div>
                <div className="strength-checklist">
                  <span>✓ 8+ chars</span>
                  <span>✓ Upper & lower</span>
                  <span>✓ Number (0-9)</span>
                  <span>✓ Symbol (@#$)</span>
                </div>
              </div>

              {/* Admin Gateway Notice */}
              <div className="auth-notice-pill" style={{ background: '#f1f5f9' }}>
                <span style={{ color: '#273b64', fontWeight: 600 }}>256-Bit SSL Encrypted Admin Gateway</span>
              </div>

              <button className="btn-login-admin" onClick={handleLoginSubmit}>
                {authLoading ? 'Verifying...' : 'Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================================
  // AUTHENTICATED: RENDER ROLE-BASED APPLICATION WORKSPACE
  // =============================================================
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner with Active User Identity & Role Switcher */}
      <div style={{ background: '#0f172a', color: '#ffffff', padding: '6px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: userRole === 'admin' ? '#273b64' : '#15803d', color: '#ffffff', padding: '2px 8px', borderRadius: 4, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {userRole} WORKSPACE
          </span>
          <span>Logged in as: <strong>{userRole === 'farmer' ? farmer.name : emailInput}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {userRole === 'farmer' && (
            <button
              style={{
                background: isMobileFrameView ? '#15803d' : '#334155',
                color: '#ffffff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onClick={() => setIsMobileFrameView(!isMobileFrameView)}
            >
              {isMobileFrameView ? 'Smartphone App View' : 'Expanded View'}
            </button>
          )}
          <button
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
            onClick={handleSignOut}
          >
            Switch Role / Sign Out
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 1. FARMER ROLE WORKSPACE (PAGES 2-9 OF PDF)             */}
      {/* ------------------------------------------------------- */}
      {userRole === 'farmer' && isMobileFrameView && (
        <div className="mobile-app-root" style={{ flex: 1, padding: '16px 0' }}>
          <div className="phone-chassis">
            {/* Notch / Dynamic Island */}
            <div className="mobile-notch">
              <div className="mobile-camera-dot"></div>
            </div>

            {/* Top Phone Status Bar */}
            <div className="phone-status-bar">
              <span>19:14</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>5G</span>
                <span>98%</span>
              </div>
            </div>

            {/* Mobile App Bar Header */}
            <div className="mobile-app-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>SmartProcure</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>Mobile Kisan App</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="lang-selector-btn"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={handleVoiceReadout}
                >
                  {isSpeaking ? '...' : lang === 'te' ? 'వాయిస్' : lang === 'hi' ? 'आवाज़' : 'Voice'}
                </button>

                <button
                  className="lang-selector-btn"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={() => setLang(lang === 'te' ? 'en' : lang === 'en' ? 'hi' : 'te')}
                >
                  {lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'English'}
                </button>

                <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                  {farmer?.name?.charAt(0) || 'P'}
                </div>
              </div>
            </div>

            {/* Scrollable Mobile Content */}
            <div className="mobile-scroll-content">
              <div className="content-body" style={{ padding: 0 }}>
                {farmerActiveTab === 'dashboard' && (
                  <div>
                    <div className="dashboard-greeting">
                      <div>
                        <h2 className="greeting-title">{t.goodMorning || 'Good Morning'}, {farmer?.name}</h2>
                        <p className="greeting-sub">{t.farmerId || 'Farmer ID'}: {farmer?.id} • {farmer?.district || 'Kakinada'} • {farmer?.state || 'Andhra Pradesh'}</p>
                      </div>
                      <div className="header-action-group">
                        <button className="btn-header-primary" onClick={() => { setFarmerActiveTab('book'); setWizardStep(1); }}>
                          {t.bookSlot || 'Book Slot'}
                        </button>
                        <button className="btn-header-secondary" onClick={() => setFarmerActiveTab('token')}>
                          {t.myPass || 'My Pass & QR'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }} onClick={() => setFarmerActiveTab('mybookings')}>
                        {t.myBookings || 'My Bookings'}
                      </button>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 700 }} onClick={() => setFarmerActiveTab('centres')}>
                        {t.centres || 'Mandi Centres & Maps'}
                      </button>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }} onClick={() => setFarmerActiveTab('prices')}>
                        {t.prices || 'MSP Rates'}
                      </button>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }} onClick={() => setFarmerActiveTab('notifications')}>
                        {t.notifications || 'Notifications'} (4)
                      </button>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }} onClick={() => setFarmerActiveTab('announcements')}>
                        {t.announcements || 'Announcements'}
                      </button>
                      <button className="lang-selector-btn" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }} onClick={() => setFarmerActiveTab('feedback')}>
                        {t.feedback || 'Feedback'}
                      </button>
                    </div>

                    <div className="kpi-row">
                      <div className="kpi-card">
                        <span className="kpi-label">{t.activeToken || 'ACTIVE TOKEN'}</span>
                        <span className="kpi-value">{myBookingsList.find(b => b.status === 'CONFIRMED')?.tokenId || 'None'}</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">{t.bookingsCount || 'BOOKINGS COUNT'}</span>
                        <span className="kpi-value">{myBookingsList.length} {t.booked || 'Booked'}</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">{t.totalQuantity || 'TOTAL QUANTITY'}</span>
                        <span className="kpi-value">{myBookingsList.reduce((acc, b) => acc + (b.expectedQuantityQuintals || 0), 0)} {t.quintals || 'Qtl'}</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">{t.totalEarnedDbt || 'TOTAL EARNED (DBT)'}</span>
                        <span className="kpi-value">₹{myBookingsList.reduce((acc, b) => acc + (b.estimatedPayout || 0), 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* PROCUREMENT DAY DIRECTIONS ALERT BANNER */}
                    {activeBooking && (
                      <div style={{ background: '#f0fdf4', border: '2px solid #15803d', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.72rem', background: '#15803d', color: '#ffffff', padding: '3px 10px', borderRadius: 9999, fontWeight: 800 }}>
                                {t.procurementDayAlert || 'TODAY IS YOUR PROCUREMENT DAY!'}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                                {t.dateTimeSlot || 'Slot'}: {activeBooking.bookingDate} ({activeBooking.timeWindow})
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
                              {activeBooking.centreName}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0 }}>
                              {getCropTitle(activeBooking.cropName)} ({activeBooking.expectedQuantityQuintals} {t.quintals || 'Qtl'}) • {t.tokenNumber || 'Token'}: <strong>{activeBooking.tokenId}</strong>
                            </p>
                          </div>

                          <button
                            type="button"
                            className="btn-primary-block"
                            style={{ width: 'auto', background: '#15803d', borderColor: '#15803d', padding: '10px 20px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={() => {
                              const currentMandi = centresList.find((c) => c.name === activeBooking.centreName) || centresList[0];
                              window.open(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${currentMandi.coords}&travelmode=driving`, '_blank');
                            }}
                          >
                            {t.procurementDayDirections || 'Get Procurement Day Directions (Google Maps)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5-Stage Live Queue Tracker */}
                    {activeBooking && (
                      <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                          {t.liveMandiStageTracker || 'Live Mandi Stage Tracker'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                          {[
                            { id: 'GATE_ENTRY', label: `1. ${t.gateEntry || 'Gate Entry'}` },
                            { id: 'WAITING', label: `2. ${t.waiting || 'Waiting Lounge'}` },
                            { id: 'QUALITY', label: `3. ${t.qualityCheck || 'Quality Assay'}` },
                            { id: 'WEIGHING', label: `4. ${t.weighbridge || 'Weighbridge'}` },
                            { id: 'COMPLETED', label: `5. ${t.transferredToBank || 'Direct DBT'}` }
                          ].map((st, i) => {
                            const stages = ['GATE_ENTRY', 'WAITING', 'QUALITY', 'WEIGHING', 'COMPLETED'];
                            const currentIdx = stages.indexOf(activeBooking.currentStage);
                            const isCurrent = i === currentIdx;

                            return (
                              <div
                                key={st.id}
                                style={{
                                  padding: '12px 10px',
                                  borderRadius: 8,
                                  textAlign: 'center',
                                  background: isCurrent ? 'var(--primary-light)' : '#ffffff',
                                  border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-color)'
                                }}
                              >
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isCurrent ? 'var(--primary)' : 'var(--text-main)' }}>{st.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="dashboard-grid">
                      {activeBooking ? (
                        <div className="active-booking-card">
                          <div className="card-header-flex">
                            <span className="card-title-badge">{t.activeBooking || 'ACTIVE BOOKING'}</span>
                            <span className="status-pill-booked">{t.booked || 'BOOKED'}</span>
                          </div>
                          <div className="booking-token-lg">{activeBooking.tokenId}</div>
                          <div className="booking-details-grid">
                            <div className="detail-item-col"><span className="detail-label">{t.centre || 'CENTRE'}</span><span className="detail-val">{activeBooking.centreName}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.crop || 'CROP'}</span><span className="detail-val">{getCropTitle(activeBooking.cropName)}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.date || 'DATE'}</span><span className="detail-val">{activeBooking.bookingDate}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.timeWindow || 'TIME'}</span><span className="detail-val">{activeBooking.timeWindow}</span></div>
                          </div>
                          <div className="card-link-action" onClick={() => setFarmerActiveTab('token')}>{t.viewTokenDetails || 'View full token details →'}</div>
                        </div>
                      ) : (
                        <div className="active-booking-card" style={{ textAlign: 'center', padding: 32 }}>
                          <p style={{ margin: '10px 0' }}>{t.noActiveBooking || 'No active booking slot.'}</p>
                          <button className="btn-header-primary" style={{ alignSelf: 'center' }} onClick={() => { setFarmerActiveTab('book'); setWizardStep(1); }}>{t.bookSlotNow || '+ Book a Procurement Slot'}</button>
                        </div>
                      )}

                      <div className="live-queue-card">
                        <div className="queue-card-title">{t.liveQueueStatus || 'LIVE QUEUE STATUS'}</div>
                        <div className="queue-stats-split">
                          <div className="queue-stat-item"><span className="queue-stat-label">{t.currentlyServing || 'CURRENTLY SERVING'}</span><span className="queue-stat-num">{activeBooking?.currentServedToken || 'PDC-A004'}</span></div>
                          <div className="queue-stat-item"><span className="queue-stat-label">{t.farmersAhead || 'PEOPLE AHEAD'}</span><span className="queue-stat-num">{activeBooking?.farmersAhead || 0}</span></div>
                        </div>
                        <div className="queue-wait-pill">{t.wait || 'Wait'}: ~0 {t.mins || 'min'}</div>
                      </div>
                    </div>

                  {/* Google Maps Live Tracking & Directions Widget on Dashboard */}
                  {(() => {
                    const nearestMandi = centresList.find(c => c.centreId === selectedCentre) || centresList[0];
                    return (
                      <div className="gmaps-tracking-card" style={{ marginTop: 20 }}>
                        <div className="gmaps-header-bar">
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                              GPS Live Mandi Tracking: {nearestMandi.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {nearestMandi.address} ({nearestMandi.distanceKm} km away)
                            </div>
                          </div>
                          <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 9999, fontWeight: 800 }}>
                            ● Google Maps Live Directions
                          </span>
                        </div>

                        <div className="gmaps-iframe-container" style={{ height: 190 }}>
                          <iframe
                            title="Dashboard Google Maps Tracking"
                            src={`https://maps.google.com/maps?q=${nearestMandi.coords}&z=14&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>

                        <div className="gmaps-actions-row">
                          <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                            Hours: {nearestMandi.hours} • Phone: {nearestMandi.contact}
                          </div>
                          <button
                            type="button"
                            className="lang-selector-btn"
                            style={{ background: '#15803d', color: '#ffffff', borderColor: '#15803d', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${nearestMandi.coords}&travelmode=driving`, '_blank')}
                          >
                            {t.googleMapsDirections || 'Open Google Maps Directions'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* BOOK A SLOT WIZARD */}
              {farmerActiveTab === 'book' && (
                <div className="booking-wizard-card">
                  <div className="wizard-top-bar">
                    <div className="wizard-title-group">
                      <h2>{t.bookSlot || 'Book Procurement Slot'}</h2>
                      <p>{t.wizardFlowDesc || 'Flow: 1. Select Place → 2. Select Date & Slot → 3. Select Crop & Quantity → 4. Confirm'}</p>
                    </div>
                  </div>

                  <div className="wizard-progress">
                    <div className="wizard-progress-bar" style={{ width: `${(wizardStep / 4) * 100}%` }}></div>
                  </div>

                  <div className="wizard-body">
                    {/* STEP 1: SUGGEST & SELECT NEAREST PROCUREMENT CENTRE (PLACE) */}
                    {wizardStep === 1 && (
                      <div>
                        <div className="form-group-section">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <div className="section-subtitle">{t.step1 || '1. Select Nearest Procurement Centre (Place)'}</div>
                              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                                Suggested mandis ranked by proximity to your registered district ({farmer?.district || 'Kakinada'})
                              </p>
                            </div>
                            <button
                              className="lang-selector-btn"
                              style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 700, fontSize: '0.75rem' }}
                              onClick={() => {
                                setGpsDetecting(true);
                                setTimeout(() => {
                                  setGpsDetecting(false);
                                  setSelectedCentre('PC-AP-KKD-0402');
                                  setGpsNearestStatus(t.gpsLocatedSuccess || 'GPS Located: Nearest Mandi is Sri Lakshmi Centre (4.2 km away)!');
                                }, 600);
                              }}
                            >
                              {gpsDetecting ? (t.locatingGps || 'Locating via GPS...') : (t.suggestNearest || 'Detect GPS Nearest Mandi')}
                            </button>
                          </div>

                          {gpsNearestStatus && (
                            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: 8, fontSize: '0.78rem', color: '#15803d', fontWeight: 700, marginBottom: 12 }}>
                              {gpsNearestStatus}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                            {centresList.map((c, idx) => {
                              const isSelected = selectedCentre === c.centreId;
                              return (
                                <div
                                  key={c.centreId}
                                  style={{
                                    border: isSelected ? '2px solid #15803d' : '1px solid #cbd5e1',
                                    borderRadius: 10,
                                    padding: 14,
                                    background: isSelected ? '#f0fdf4' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => setSelectedCentre(c.centreId)}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <div>
                                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.address} • {c.district}</div>
                                    </div>
                                    <span style={{
                                      fontSize: '0.7rem',
                                      padding: '3px 10px',
                                      borderRadius: 9999,
                                      fontWeight: 800,
                                      background: idx === 0 ? '#15803d' : '#f1f5f9',
                                      color: idx === 0 ? '#ffffff' : '#475569'
                                    }}>
                                      {idx === 0 ? `RECOMMENDED (${c.distanceKm} km away)` : `${c.distanceKm} km away`}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: 6, display: 'flex', gap: 16 }}>
                                    <span><strong>Hours:</strong> {c.hours}</span>
                                    <span><strong>Contact:</strong> {c.contact}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Google Maps Embed Preview of Selected Mandi */}
                          {(() => {
                            const currentMandi = centresList.find((c) => c.centreId === selectedCentre) || centresList[0];
                            return (
                              <div className="gmaps-tracking-card">
                                <div className="gmaps-header-bar">
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Map Preview: {currentMandi.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{currentMandi.address}</div>
                                  </div>
                                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 9999, fontWeight: 800 }}>
                                    ● Google Maps GPS Route ({currentMandi.distanceKm} km)
                                  </span>
                                </div>

                                <div className="gmaps-iframe-container" style={{ height: 160 }}>
                                  <iframe
                                    title="Google Maps Mandi Preview"
                                    src={`https://maps.google.com/maps?q=${currentMandi.coords}&z=14&output=embed`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div style={{ marginTop: 20, textAlign: 'right' }}>
                          <button
                            className="btn-primary-block"
                            style={{ width: 'auto', display: 'inline-flex', padding: '12px 28px' }}
                            onClick={() => setWizardStep(2)}
                          >
                            {t.nextDateSlot || 'Next: Select Date & Time Slot →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: SELECT DATE & TIME SLOT */}
                    {wizardStep === 2 && (
                      <div>
                        <div className="form-group-section">
                          <div className="section-subtitle">{t.step2 || '2. Select Date & Time Slot'}</div>
                          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.82rem', marginBottom: 16, border: '1px solid #e2e8f0' }}>
                            {t.selectedMandiPlace || 'Selected Mandi Place'}: <strong>{(centresList.find(c => c.centreId === selectedCentre) || centresList[0]).name}</strong> ({(centresList.find(c => c.centreId === selectedCentre) || centresList[0]).distanceKm} {t.distanceKm || 'km away'})
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <label className="input-label">{t.selectDate || 'Calendar Date'} *</label>
                            <input type="date" className="form-control-custom" value={preferredDate} min="2026-09-08" onChange={(e) => setPreferredDate(e.target.value)} />
                          </div>

                          {/* Quick Date Select Chips */}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{t.quickDate || 'Quick Select'}:</span>
                            {['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'].map((dt, idx) => (
                              <button
                                key={dt}
                                type="button"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: 9999,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: preferredDate === dt ? '1px solid #15803d' : '1px solid #cbd5e1',
                                  background: preferredDate === dt ? '#dcfce7' : '#ffffff',
                                  color: preferredDate === dt ? '#15803d' : '#475569',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setPreferredDate(dt)}
                              >
                                {idx === 0 ? `${t.today || 'Today'} (08 Sep)` : idx === 1 ? `${t.tomorrow || 'Tomorrow'} (09 Sep)` : dt}
                              </button>
                            ))}
                          </div>

                          <div className="section-subtitle" style={{ fontSize: '0.9rem', marginBottom: 10 }}>{t.selectTimeWindow || 'Select Time Window'}</div>
                          <div className="slot-cards-grid">
                            {[
                              { id: 'SLOT-09-11', time: '09:00 AM - 11:00 AM', spotsLeft: 45 },
                              { id: 'SLOT-11-01', time: '11:00 AM - 01:00 PM', spotsLeft: 18 },
                              { id: 'SLOT-02-04', time: '02:00 PM - 04:00 PM', spotsLeft: 32 }
                            ].map((slot) => (
                              <div
                                key={slot.id}
                                className={`slot-selection-card ${selectedSlotId === slot.id ? 'selected' : ''}`}
                                onClick={() => { setSelectedSlotId(slot.id); setSelectedSlotTime(slot.time); }}
                              >
                                <div className="slot-time-text">{slot.time}</div>
                                <div className="slot-avail-badge"><span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span> {t.available || 'AVAILABLE'} ({slot.spotsLeft} {t.spotsLeft || 'spots left'})</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="wizard-footer-nav">
                          <button className="btn-header-secondary" onClick={() => setWizardStep(1)}>{t.backToPlace || '← Back to Place'}</button>
                          <button className="btn-primary-block" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setWizardStep(3)}>{t.nextCropQty || 'Next: Select Crop & Quantity →'}</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: SELECT CROP & QUANTITY */}
                    {wizardStep === 3 && (
                      <div>
                        <div className="form-group-section">
                          <div className="section-subtitle">{t.step3 || '3. Select Crop & Quantity'}</div>
                          <div className="form-grid-2">
                            <div>
                              <label className="input-label">{t.selectCrop || 'Crop Type'} *</label>
                              <select className="form-control-custom" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                                {cropsList.map((c) => (
                                  <option key={c.cropId} value={c.cropId}>{getCropTitle(c.name)} (₹{c.mspRatePerQuintal}/Qtl)</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="input-label">{t.estimatedQty || 'Expected Quantity (Qtl)'} *</label>
                              <input type="number" className="form-control-custom" value={selectedQty} onChange={(e) => setSelectedQty(Number(e.target.value))} min={1} />
                            </div>
                          </div>

                          {/* Est Payout Calculation Card */}
                          {(() => {
                            const cObj = cropsList.find(c => c.cropId === selectedCrop) || cropsList[0];
                            const estPayout = selectedQty * cObj.mspRatePerQuintal;
                            return (
                              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, marginTop: 14 }}>
                                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>{t.estMspPayoutDbt || 'ESTIMATED GOVT MSP PAYOUT (DBT)'}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                                  ₹{estPayout.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: 2 }}>
                                  {t.basedOnGovtMsp || 'Based on Govt MSP of'} ₹{cObj.mspRatePerQuintal}/Qtl for {selectedQty} {t.quintals || 'Quintals'} of {getCropTitle(cObj.name)}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="wizard-footer-nav">
                          <button className="btn-header-secondary" onClick={() => setWizardStep(2)}>{t.backToDateSlot || '← Back to Date & Slot'}</button>
                          <button className="btn-primary-block" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setWizardStep(4)}>{t.nextReviewConfirm || 'Next: Review & Confirm →'}</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: REVIEW & CONFIRM BOOKING */}
                    {wizardStep === 4 && (
                      <div>
                        <div className="section-subtitle">{t.step4 || '4. Review & Confirm Booking'}</div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>{t.reviewInstructions || 'Please review your booking details before generating your official gate pass.'}</p>

                        {(() => {
                          const mObj = centresList.find(c => c.centreId === selectedCentre) || centresList[0];
                          const crObj = cropsList.find(c => c.cropId === selectedCrop) || cropsList[0];
                          const totalPayout = selectedQty * crObj.mspRatePerQuintal;
                          return (
                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: 18, marginBottom: 20 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                                <div className="detail-item-col"><span className="detail-label">{t.procurementPlace || 'PROCUREMENT PLACE'}</span><span className="detail-val">{mObj.name} ({mObj.distanceKm} {t.distanceKm || 'km away'})</span></div>
                                <div className="detail-item-col"><span className="detail-label">{t.dateTimeSlot || 'DATE & TIME SLOT'}</span><span className="detail-val">{preferredDate} ({selectedSlotTime})</span></div>
                                <div className="detail-item-col"><span className="detail-label">{t.cropType || 'CROP TYPE'}</span><span className="detail-val">{getCropTitle(crObj.name)}</span></div>
                                <div className="detail-item-col"><span className="detail-label">{t.expectedQuantity || 'EXPECTED QUANTITY'}</span><span className="detail-val">{selectedQty} {t.quintals || 'Quintals'}</span></div>
                                <div className="detail-item-col" style={{ gridColumn: 'span 2' }}>
                                  <span className="detail-label">{t.estPayoutDbt || 'ESTIMATED PAYOUT (DIRECT BANK TRANSFER)'}</span>
                                  <span className="detail-val" style={{ color: '#15803d', fontSize: '1.1rem' }}>₹{totalPayout.toLocaleString('en-IN')} ({t.mspTag || 'Govt MSP'} ₹{crObj.mspRatePerQuintal}/Qtl)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="wizard-footer-nav">
                          <button className="btn-header-secondary" onClick={() => setWizardStep(3)}>{t.backToCrop || '← Back to Crop'}</button>
                          <button
                            className="btn-primary-block"
                            style={{ width: 'auto', padding: '12px 28px' }}
                            onClick={() => {
                              setIsBookingSubmitting(true);
                              setTimeout(() => {
                                setIsBookingSubmitting(false);
                                const mObj = centresList.find(c => c.centreId === selectedCentre) || centresList[0];
                                const crObj = cropsList.find(c => c.cropId === selectedCrop) || cropsList[0];
                                const totalPayout = selectedQty * crObj.mspRatePerQuintal;
                                const newTokenId = `PDC-${Math.floor(100000 + Math.random() * 900000)}`;

                                const newBookingObj = {
                                  bookingId: `PB-${Math.floor(100000 + Math.random() * 900000)}`,
                                  tokenId: newTokenId,
                                  centreId: mObj.centreId,
                                  centreName: mObj.name,
                                  centreDistrict: mObj.district,
                                  cropId: crObj.cropId,
                                  cropName: crObj.name,
                                  expectedQuantityQuintals: selectedQty,
                                  bookingDate: preferredDate,
                                  timeWindow: selectedSlotTime,
                                  status: 'CONFIRMED',
                                  currentStage: 'GATE_ENTRY',
                                  currentServedToken: 'PDC-A004',
                                  farmersAhead: 2,
                                  estimatedPayout: totalPayout,
                                  mspRate: crObj.mspRatePerQuintal,
                                  qrPayload: `APMC|${newTokenId}|${mObj.centreId}|${farmer?.name || 'Farmer'}|${preferredDate}|${selectedSlotTime}|${crObj.name}|${selectedQty}QTL`
                                };

                                setActiveBooking(newBookingObj);
                                setMyBookingsList([newBookingObj, ...myBookingsList]);
                                confetti({ particleCount: 90, spread: 80 });
                                setFarmerActiveTab('token');
                                setWizardStep(1);
                              }, 400);
                            }}
                          >
                            {isBookingSubmitting ? '...' : (t.confirmAndGeneratePass || 'Confirm & Generate Pass QR →')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MY TOKEN WITH GENUINE SCANNABLE QR CODE */}
              {farmerActiveTab === 'token' && (
                <div className="token-details-container">
                  {activeBooking && (
                    <div className="token-main-card">
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 9999, fontWeight: 800 }}>
                          {t.verifiedGovtStamp || 'Verified Govt DoCA APMC Stamp'}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 6, color: '#0f172a' }}>{t.officialGatePass || 'OFFICIAL APMC GATE PASS QR'}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.presentAtGate || 'Present this scannable QR Code at Mandi Gate #1'}</p>
                      </div>

                      <div className="qr-code-box">
                        <QRCodeCanvas value={activeBooking.qrPayload} size={190} />
                      </div>

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '14px 0' }}>
                        <button className="btn-download-pass" onClick={() => window.print()}>
                          {t.printPass || 'Print Pass'}
                        </button>
                        <button
                          className="btn-download-pass"
                          style={{ background: '#15803d', borderColor: '#15803d' }}
                          onClick={() => {
                            confetti({ particleCount: 50, spread: 60 });
                            alert('Official APMC Gate Pass PDF downloaded to your device.');
                          }}
                        >
                          {t.downloadPass || 'Download Official Gate Pass (PDF)'}
                        </button>
                      </div>

                      <div className="token-number-header">
                        <span className="token-header-label">{t.token || 'TOKEN NUMBER'}</span>
                        <div className="token-header-code">{activeBooking.tokenId}</div>
                        <span className="status-pill-booked">{(t as any)[activeBooking.currentStage || 'WAITING'] || activeBooking.status}</span>
                      </div>

                      <div className="token-info-table">
                        <div className="detail-item-col"><span className="detail-label">{t.farmerNameLabel || 'FARMER DETAILS'}</span><span className="detail-val">{farmer?.name} ({farmer?.mobile})</span></div>
                        <div className="detail-item-col"><span className="detail-label">{t.step2 || 'CENTRE'}</span><span className="detail-val">{activeBooking.centreName}</span></div>
                        <div className="detail-item-col"><span className="detail-label">{t.selectCrop || 'CROP'}</span><span className="detail-val">{getCropTitle(activeBooking.cropName)} ({activeBooking.expectedQuantityQuintals} Qtl)</span></div>
                        <div className="detail-item-col"><span className="detail-label">{t.step3 || 'TIME SLOT'}</span><span className="detail-val">{activeBooking.timeWindow}</span></div>
                        <div className="detail-item-col"><span className="detail-label">{t.selectDate || 'DATE'}</span><span className="detail-val">{activeBooking.bookingDate}</span></div>
                        <div className="detail-item-col"><span className="detail-label">{t.mspTag || 'ESTIMATED PAYOUT'}</span><span className="detail-val" style={{ color: 'var(--primary)' }}>₹{activeBooking.estimatedPayout.toLocaleString('en-IN')} (₹{activeBooking.mspRate}/Qtl)</span></div>
                      </div>

                      <div className="token-action-buttons">
                        <button className="btn-cancel-booking" onClick={() => setShowCancelModal(true)}>{t.cancelBooking || 'Cancel Booking'}</button>
                        <button className="btn-reschedule-booking" onClick={() => setShowRescheduleModal(true)}>{t.reschedule || 'Reschedule'}</button>
                      </div>

                      {/* Google Maps Live Navigation & Tracking for Booked Mandi */}
                      {(() => {
                        const bookedMandi = centresList.find((c) => c.name === activeBooking.centreName) || centresList[0];
                        return (
                          <div className="gmaps-tracking-card" style={{ marginTop: 18 }}>
                            <div className="gmaps-header-bar">
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                  Live Navigation: {bookedMandi.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {bookedMandi.address} ({bookedMandi.distanceKm} km away)
                                </div>
                              </div>
                              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 9999, fontWeight: 800 }}>
                                ● Mandi Gate Route Active
                              </span>
                            </div>

                            <div className="gmaps-iframe-container" style={{ height: 190 }}>
                              <iframe
                                title="Booked Mandi Google Maps Directions"
                                src={`https://maps.google.com/maps?q=${bookedMandi.coords}&z=14&output=embed`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>

                            <div className="gmaps-actions-row">
                              <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                                Hours: {bookedMandi.hours} • Phone: {bookedMandi.contact}
                              </div>
                              <button
                                type="button"
                                className="lang-selector-btn"
                                style={{ background: '#15803d', color: '#ffffff', borderColor: '#15803d', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${bookedMandi.coords}&travelmode=driving`, '_blank')}
                              >
                                {t.googleMapsDirections || 'Navigate to Mandi on Google Maps'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* APMC PROCUREMENT CENTRES & GOOGLE MAPS LIVE TRACKING */}
              {farmerActiveTab === 'centres' && (
                <div className="section-card" style={{ maxWidth: 880, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.centresTitle || 'APMC Government Procurement Centres'}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Live Google Maps integration, distance metrics, and turn-by-turn driving directions to nearby APMC mandis.
                      </p>
                    </div>
                    <button
                      className="lang-selector-btn"
                      style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 700, fontSize: '0.78rem' }}
                      onClick={() => {
                        setGpsDetecting(true);
                        setTimeout(() => {
                          setGpsDetecting(false);
                          setGpsNearestStatus(t.gpsLocatedSuccess || 'GPS Located: Recommended Sri Lakshmi APMC Centre (4.2 km away)!');
                        }, 500);
                      }}
                    >
                      {gpsDetecting ? (t.locatingGps || 'Locating via GPS...') : (t.suggestNearest || 'Detect GPS Nearest Mandi')}
                    </button>
                  </div>

                  {gpsNearestStatus && (
                    <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', color: '#15803d', fontWeight: 700, marginBottom: 16 }}>
                      {gpsNearestStatus}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {centresList.map((c) => (
                      <div key={c.centreId} className="gmaps-tracking-card" style={{ marginTop: 0 }}>
                        <div className="gmaps-header-bar">
                          <div>
                            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.address} • {c.district}</div>
                          </div>
                          <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 9999, fontWeight: 800 }}>
                            ● {c.distanceKm} {t.distanceKm || 'km away'}
                          </span>
                        </div>

                        <div className="gmaps-iframe-container" style={{ height: 200 }}>
                          <iframe
                            title={`Google Maps ${c.name}`}
                            src={`https://maps.google.com/maps?q=${c.coords}&z=14&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>

                        <div className="gmaps-actions-row" style={{ flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                            <strong style={{ color: '#0f172a' }}>Hours:</strong> {c.hours} • <strong style={{ color: '#0f172a' }}>Contact:</strong> {c.contact}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="lang-selector-btn"
                              style={{ background: '#15803d', color: '#ffffff', borderColor: '#15803d', fontWeight: 700, fontSize: '0.75rem', padding: '6px 14px' }}
                              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${c.coords}&travelmode=driving`, '_blank')}
                            >
                              {t.googleMapsDirections || 'Live Directions'}
                            </button>
                            <button
                              type="button"
                              className="btn-header-primary"
                              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedCentre(c.centreId);
                                setFarmerActiveTab('book');
                                setWizardStep(1);
                              }}
                            >
                              Book Slot Here →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MY BOOKINGS (PLACE, TIMINGS, CROP, QUANTITY) */}
              {farmerActiveTab === 'mybookings' && (
                <div className="section-card" style={{ maxWidth: 840, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.myBookingsTitle || 'My APMC Slot Bookings'}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.myBookingsSub || 'Complete history of your booked slots, mandi locations, timings, and quantities.'}</p>
                    </div>
                    <button className="btn-call-next" style={{ background: '#15803d', fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setFarmerActiveTab('book')}>
                      {t.newBooking || '+ New Booking'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {myBookingsList.map((b) => (
                      <div key={b.bookingId} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 16, background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', letterSpacing: 0.5 }}>{t.bookingId || 'BOOKING ID'}: {b.bookingId}</span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{getCropTitle(b.cropName)}</h4>
                          </div>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: b.status === 'CONFIRMED' ? '#dcfce7' : b.status === 'COMPLETED' ? '#e0f2fe' : '#f1f5f9',
                            color: b.status === 'CONFIRMED' ? '#15803d' : b.status === 'COMPLETED' ? '#0369a1' : '#64748b'
                          }}>
                            ● {(t as any)[b.status] || b.status} ({t.token || 'Token'}: {b.tokenId})
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.82rem' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{t.placeMandi || 'PLACE / MANDI'}</div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{b.centreName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.centreDistrict}</div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{t.dateTimings || 'DATE & TIMINGS'}</div>
                            <div style={{ fontWeight: 800, color: '#15803d' }}>{b.bookingDate}</div>
                            <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>{b.timeWindow}</div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{t.cropAndQuantity || 'CROP & QUANTITY'}</div>
                            <div style={{ fontWeight: 800, color: '#2563eb' }}>{b.expectedQuantityQuintals} {t.quintals || 'Quintals'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.estPayoutShort || 'Est. Payout'}: ₹{b.estimatedPayout.toLocaleString('en-IN')}</div>
                          </div>
                        </div>

                        {b.status === 'CONFIRMED' && (
                          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              className="lang-selector-btn"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#15803d', color: '#ffffff', borderColor: '#15803d', fontWeight: 700 }}
                              onClick={() => {
                                const mandi = centresList.find(c => c.name === b.centreName) || centresList[0];
                                window.open(`https://www.google.com/maps/dir/?api=1&origin=16.9800,82.2400&destination=${mandi.coords}&travelmode=driving`, '_blank');
                              }}
                            >
                              {t.googleMapsDirections || 'Google Maps Directions'}
                            </button>
                            <button className="lang-selector-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setFarmerActiveTab('token')}>
                              {t.viewDigitalPass || 'View Digital QR Pass'}
                            </button>
                            <button className="lang-selector-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#b91c1c', borderColor: '#fca5a5' }} onClick={() => setShowCancelModal(true)}>
                              {t.cancelBooking || 'Cancel'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAYMENTS */}
              {farmerActiveTab === 'payments' && (
                <div className="section-card" style={{ maxWidth: 840, margin: '0 auto' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>{t.paymentTransactions || 'Payment Transactions (DBT)'}</h3>
                  <table className="data-table">
                    <thead><tr><th>{t.receiptNo || 'RECEIPT #'}</th><th>{t.date || 'DATE'}</th><th>{t.crop || 'CROP'}</th><th>{t.weight || 'WEIGHT'}</th><th>{t.rate || 'RATE'}</th><th>{t.total || 'TOTAL'}</th><th>{t.status || 'STATUS'}</th></tr></thead>
                    <tbody>
                      {recentProcurements.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 800 }}>{p.procurementId}</td>
                          <td>{p.date}</td><td>{getCropTitle(p.crop)}</td><td>{p.netWeightQuintals} {t.quintals || 'Qtl'}</td><td>₹{p.ratePerQuintal}{t.perQuintal || '/Qtl'}</td>
                          <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{p.totalAmount.toLocaleString('en-IN')}</td>
                          <td><span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>{t.transferred || 'Transferred'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MSP & LIVE MARKET PRICES */}
              {farmerActiveTab === 'prices' && (
                <div className="section-card" style={{ maxWidth: 840, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t.marketRatesTitle || 'Live Market Rates & Govt MSP (Season 2026)'}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.marketRatesSub || 'Updated dynamically when APMC market rates and Govt MSP change.'}</p>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800 }}>
                      {t.dynamicallyUpdated || 'Dynamically Updated'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    {cropsList.map((c) => (
                      <div key={c.cropId} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 16, background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{getCropTitle(c.name)}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Season: {c.season || 'Kharif 2026'}</div>
                          </div>
                          <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {c.lastUpdated ? `Updated: ${c.lastUpdated}` : 'Live'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{t.govtMspRateLabel || 'GOVT MSP RATE'}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{c.mspRatePerQuintal}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t.perQuintal || '/ Quintal'}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{t.currentMarketPriceLabel || 'CURRENT MARKET PRICE'}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>₹{c.marketPricePerQuintal || c.mspRatePerQuintal + 80}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t.perQuintal || '/ Quintal'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS & SMS ALERTS (FEATURE 8 & 13) */}
              {farmerActiveTab === 'notifications' && (
                <div className="section-card" style={{ maxWidth: 840, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t.notificationsTitle || 'Notifications & SMS Log Alerts'}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.notificationsSub || 'Real-time Push notifications and SMS logs for bookings, queue status, and DBT payments.'}</p>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800 }}>
                      {t.appSmsActive || 'App + SMS Active'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notificationsList.map((n) => (
                      <div key={n.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 14, background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{n.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: 4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>Channel: {n.channel} • {n.time}</div>
                        </div>
                        <span style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          {n.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS (FEATURE 14) */}
              {farmerActiveTab === 'announcements' && (
                <div className="section-card" style={{ maxWidth: 840, margin: '0 auto' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>{t.announcementsTitle || 'Important Ministry & Mandi Announcements'}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {announcementsList.map((a) => (
                      <div key={a.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 16, background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>{a.tag}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{a.date}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{a.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>{a.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEEDBACK (FEATURE 15) */}
              {farmerActiveTab === 'feedback' && (
                <div className="section-card" style={{ maxWidth: 640, margin: '0 auto' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>{t.feedbackTitle || 'Provide Mandi Experience Feedback'}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>{t.feedbackSub || 'Rate your experience with QR check-in, quality assaying, and weighbridge speed.'}</p>

                  {feedbackSubmitted ? (
                    <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{t.thankYouFeedback || 'Thank You for Your Feedback!'}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#166534', marginTop: 4 }}>{t.thankYouFeedbackSub || 'Your rating helps the Ministry of Consumer Affairs improve procurement centres.'}</p>
                      <button className="lang-selector-btn" style={{ marginTop: 12 }} onClick={() => setFeedbackSubmitted(false)}>{t.submitAnotherFeedback || 'Submit Another Feedback'}</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>{t.yourRating || 'YOUR RATING'}</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: star <= feedbackRating ? '#15803d' : '#f1f5f9',
                                color: star <= feedbackRating ? '#ffffff' : '#64748b',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              onClick={() => setFeedbackRating(star)}
                            >
                              {star} Star{star > 1 ? 's' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{t.commentsSuggestions || 'COMMENTS / SUGGESTIONS'}</label>
                        <textarea
                          rows={4}
                          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          placeholder={t.placeholderFeedback || 'Share your experience at the procurement centre...'}
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                        />
                      </div>

                      <button className="btn-call-next" style={{ background: '#15803d', width: '100%' }} onClick={() => setFeedbackSubmitted(true)}>
                        {t.submitFeedback || 'Submit Feedback'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE & ACCOUNT DETAILS */}
              {farmerActiveTab === 'profile' && (
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                  <div className="profile-hero-banner">
                    <div className="profile-avatar-lg">{farmer?.name?.charAt(0) || 'P'}</div>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{farmer?.name}</h2>
                      <p style={{ opacity: 0.85 }}>Farmer ID: {farmer?.id} • Aadhaar DBT Verified</p>
                    </div>
                  </div>

                  <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t.profile || 'Profile & Bank Account Details'}</h3>
                      <button
                        className="lang-selector-btn"
                        style={{ background: isEditingProfile ? '#f1f5f9' : '#f0fdf4', color: isEditingProfile ? '#475569' : '#15803d', fontWeight: 700 }}
                        onClick={() => {
                          if (!isEditingProfile) {
                            setEditFarmerData({
                              name: farmer.name,
                              mobile: farmer.mobile,
                              district: farmer.district,
                              state: farmer.state,
                              landArea: farmer.landArea,
                              crops: farmer.crops
                            });
                          }
                          setIsEditingProfile(!isEditingProfile);
                        }}
                      >
                        {isEditingProfile ? (t.cancelEdit || 'Cancel Edit') : (t.editProfile || 'Edit Profile & Account')}
                      </button>
                    </div>

                    {!isEditingProfile ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 20 }}>
                          <div className="detail-item-col"><span className="detail-label">{t.farmerNameLabel || 'FULL NAME'}</span><span className="detail-val">{farmer?.name}</span></div>
                          <div className="detail-item-col"><span className="detail-label">{t.mobileNoLabel || 'MOBILE'}</span><span className="detail-val">{farmer?.mobile}</span></div>
                          <div className="detail-item-col"><span className="detail-label">{t.districtStateLabel || 'DISTRICT & STATE'}</span><span className="detail-val">{farmer?.district}, {farmer?.state}</span></div>
                          <div className="detail-item-col"><span className="detail-label">{t.landAreaLabel || 'LAND AREA'}</span><span className="detail-val">{farmer?.landArea}</span></div>
                          <div className="detail-item-col" style={{ gridColumn: 'span 2' }}><span className="detail-label">{t.registeredCropsLabel || 'REGISTERED CROPS'}</span><span className="detail-val">{farmer?.crops}</span></div>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{t.accountDetails || 'Aadhaar DBT Bank Account Details'}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                            <div className="detail-item-col"><span className="detail-label">{t.accountHolderLabel || 'ACCOUNT HOLDER'}</span><span className="detail-val">{bankDetails.accountHolderName}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.bankNameLabel || 'BANK NAME'}</span><span className="detail-val">{bankDetails.bankName}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.bankAccNoLabel || 'ACCOUNT NO'}</span><span className="detail-val">XXXX-XXXX-{bankDetails.accountNumber.slice(-4)}</span></div>
                            <div className="detail-item-col"><span className="detail-label">{t.ifscCodeLabel || 'IFSC CODE'}</span><span className="detail-val">{bankDetails.ifscCode}</span></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{t.editProfile || 'Edit Farmer Personal Details'}</h4>
                        <div className="form-grid-2" style={{ marginBottom: 14 }}>
                          <div><label className="input-label">{t.farmerNameLabel || 'Full Name'} *</label><input type="text" className="form-control-custom" value={editFarmerData.name} onChange={(e) => setEditFarmerData({ ...editFarmerData, name: e.target.value })} /></div>
                          <div><label className="input-label">{t.mobileNoLabel || 'Mobile Number'} *</label><input type="text" className="form-control-custom" value={editFarmerData.mobile} onChange={(e) => setEditFarmerData({ ...editFarmerData, mobile: e.target.value })} /></div>
                        </div>
                        <div className="form-grid-2" style={{ marginBottom: 14 }}>
                          <div><label className="input-label">{t.districtStateLabel || 'District & State'} *</label><input type="text" className="form-control-custom" value={editFarmerData.district} onChange={(e) => setEditFarmerData({ ...editFarmerData, district: e.target.value })} /></div>
                          <div><label className="input-label">{t.landAreaLabel || 'Land Area (Acres)'} *</label><input type="text" className="form-control-custom" value={editFarmerData.landArea} onChange={(e) => setEditFarmerData({ ...editFarmerData, landArea: e.target.value })} /></div>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '18px 0 12px 0', borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>{t.accountDetails || 'Edit Aadhaar DBT Bank Account Details'}</h4>
                        <div className="form-grid-2" style={{ marginBottom: 14 }}>
                          <div><label className="input-label">{t.accountHolderLabel || 'Account Holder Name'} *</label><input type="text" className="form-control-custom" value={bankDetails.accountHolderName} onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })} /></div>
                          <div><label className="input-label">{t.bankNameLabel || 'Bank Name'} *</label><input type="text" className="form-control-custom" value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} /></div>
                        </div>
                        <div className="form-grid-2" style={{ marginBottom: 16 }}>
                          <div><label className="input-label">{t.bankAccNoLabel || 'Account Number'} *</label><input type="text" className="form-control-custom" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} /></div>
                          <div><label className="input-label">{t.ifscCodeLabel || 'IFSC Code'} *</label><input type="text" className="form-control-custom" value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} /></div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button className="btn-header-secondary" onClick={() => setIsEditingProfile(false)}>{t.cancelEdit || 'Cancel'}</button>
                          <button
                            className="btn-primary-block"
                            style={{ width: 'auto', padding: '10px 24px' }}
                            onClick={() => {
                              setFarmer({
                                ...farmer,
                                name: editFarmerData.name,
                                mobile: editFarmerData.mobile,
                                district: editFarmerData.district,
                                landArea: editFarmerData.landArea
                              });
                              setIsEditingProfile(false);
                              confetti({ particleCount: 60, spread: 60 });
                              alert('Farmer profile and Aadhaar DBT bank account details updated successfully!');
                            }}
                          >
                            {t.saveProfile || 'Save Profile & Bank Details'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GRIEVANCES */}
              {farmerActiveTab === 'grievances' && (
                <div>
                  <div className="dashboard-greeting">
                    <h2 className="greeting-title">{t.grievances || 'Grievances'}</h2>
                    <button className="btn-header-primary" onClick={() => setShowGrievanceModal(true)}>{t.newComplaint || '+ New Complaint'}</button>
                  </div>
                  <div className="section-card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 680, margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t.noComplaintsYet || 'No Complaints Yet'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t.grievancesSub || 'If you face any issues during procurement, you can raise a grievance here.'}</p>
                  </div>
                </div>
              )}

              {/* HELP & PORTAL CONNECTIONS */}
              {farmerActiveTab === 'help' && (
                <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.helpSupport || 'Need Assistance & Web Connections'}</h2>
                  <div className="help-cards-grid">
                    <div className="help-contact-card"><h4 style={{ fontWeight: 800 }}>{t.callSupport || 'Call Support'}</h4><p style={{ color: 'var(--primary)', fontWeight: 700 }}>1800-123-4567</p></div>
                    <div className="help-contact-card"><h4 style={{ fontWeight: 800 }}>{t.emailUs || 'Email Us'}</h4><p style={{ color: 'var(--primary)', fontWeight: 700 }}>support@smartprocure.gov.in</p></div>
                    <div className="help-contact-card"><h4 style={{ fontWeight: 800 }}>{t.faq || 'FAQ'}</h4><p style={{ fontWeight: 700 }}>{t.readGuidelines || 'Read Guidelines'}</p></div>
                  </div>

                  {/* Web Portal Connections */}
                  <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginTop: 20, textAlign: 'left' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t.crossPortalTitle || 'Cross-Portal Connections (Operator & Admin)'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                      {t.crossPortalSub || 'Launch the desktop web portals for APMC Mandi Operators and DoCA Governance.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        className="btn-login-green"
                        style={{ padding: '10px 14px', fontSize: '0.82rem', width: '100%' }}
                        onClick={() => window.open('http://localhost:3010', '_blank')}
                      >
                        {t.launchOperatorWeb || 'Launch Operator Web Desk (Port 3010)'}
                      </button>
                      <button
                        className="btn-login-admin"
                        style={{ padding: '10px 14px', fontSize: '0.82rem', width: '100%' }}
                        onClick={() => window.open('http://localhost:3020', '_blank')}
                      >
                        {t.launchAdminWeb || 'Launch Admin Governance Portal (Port 3020)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Mobile Bottom Navigation Bar */}
          <div className="mobile-bottom-nav" style={{ justifyContent: 'space-around', overflowX: 'auto' }}>
            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('dashboard')}
            >
              <span>{t.home || 'Home'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'book' ? 'active' : ''}`}
              onClick={() => { setFarmerActiveTab('book'); setWizardStep(1); }}
            >
              <span>{t.bookSlot || 'Book'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'centres' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('centres')}
            >
              <span>{t.centres || 'Maps'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'mybookings' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('mybookings')}
            >
              <span>{t.myBookings || 'Bookings'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'token' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('token')}
            >
              <span>{t.myPass || 'Pass'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'prices' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('prices')}
            >
              <span>{t.prices || 'Prices'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('notifications')}
            >
              <span>{t.notifications || 'Alerts'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'payments' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('payments')}
            >
              <span>{t.history || 'Passbook'}</span>
            </button>

            <button
              className={`mobile-nav-btn ${farmerActiveTab === 'profile' ? 'active' : ''}`}
              onClick={() => setFarmerActiveTab('profile')}
            >
              <span>{t.profile || 'Profile'}</span>
            </button>
          </div>
        </div>
      </div>
      )}



      {/* GATE ENTRY SCAN MODAL */}
      {showGateScanModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Gate Entry QR / Token Verification</h3>
            <input type="text" className="input-box-auth" value={scanInputToken} onChange={(e) => setScanInputToken(e.target.value)} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-header-secondary" style={{ flex: 1 }} onClick={() => setShowGateScanModal(false)}>{t.cancelEdit || 'Cancel'}</button>
              <button className="btn-login-green" style={{ flex: 1 }} onClick={() => { alert(`Token #${scanInputToken} verified!`); setShowGateScanModal(false); }}>Verify & Arrive</button>
            </div>
          </div>
        </div>
      )}

      {/* QUALITY ASSAY MODAL */}
      {showQualityModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Quality & Moisture Assay</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label-auth">Moisture % (Standard &le; 17%)</label>
              <input type="number" step="0.1" className="input-box-auth" value={moisture} onChange={(e) => setMoisture(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-header-secondary" style={{ flex: 1 }} onClick={() => setShowQualityModal(false)}>{t.cancelEdit || 'Cancel'}</button>
              <button className="btn-login-green" style={{ flex: 1 }} onClick={() => { alert('Quality saved. Approved for weighbridge.'); setShowQualityModal(false); }}>Save Quality</button>
            </div>
          </div>
        </div>
      )}

      {/* WEIGHBRIDGE MODAL */}
      {showWeighingModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Electronic Weighbridge</h3>
            <div style={{ marginBottom: 10 }}>
              <label className="form-label-auth">Gross Weight (Kg)</label>
              <input type="number" className="input-box-auth" value={grossWeight} onChange={(e) => setGrossWeight(Number(e.target.value))} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="form-label-auth">Tare Weight (Kg)</label>
              <input type="number" className="input-box-auth" value={tareWeight} onChange={(e) => setTareWeight(Number(e.target.value))} />
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, margin: '14px 0' }}>
              <strong>Net Produce:</strong> {((grossWeight - tareWeight) / 100).toFixed(2)} Quintals
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-header-secondary" style={{ flex: 1 }} onClick={() => setShowWeighingModal(false)}>{t.cancelEdit || 'Cancel'}</button>
              <button className="btn-login-green" style={{ flex: 1 }} onClick={() => { alert('Net weight confirmed.'); setShowWeighingModal(false); }}>Confirm Net Weight</button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header-flex">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t.rescheduleBookingTitle || 'Reschedule Booking'}</h3>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }} onClick={() => setShowRescheduleModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label-auth">{t.selectNewSlot || 'Select a new time slot:'}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM'].map((s, i) => (
                  <div key={i} className={`slot-selection-card ${rescheduleSlot === s ? 'selected' : ''}`} onClick={() => setRescheduleSlot(s)} style={{ padding: 12 }}>
                    <strong>{s}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-header-secondary" style={{ flex: 1 }} onClick={() => setShowRescheduleModal(false)}>{t.cancelEdit || 'Cancel'}</button>
              <button className="btn-login-green" style={{ flex: 1 }} onClick={() => { setShowRescheduleModal(false); alert(`Rescheduled to ${rescheduleSlot}`); }}>{t.confirmReschedule || 'Confirm Reschedule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', marginBottom: 12 }}>{t.cancelBookingTitle || 'Cancel Booking'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{t.cancelWarning || 'Are you sure you want to cancel this booking? This action cannot be undone.'}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-header-secondary" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>{t.keepBooking || 'Keep'}</button>
              <button className="btn-login-green" style={{ flex: 1, background: '#ef4444' }} onClick={() => { setActiveBooking(null); setShowCancelModal(false); alert('Booking cancelled.'); }}>{t.yesCancel || 'Yes, Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
