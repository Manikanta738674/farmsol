# SmartProcure — Production Deployment & Cloud Architecture Guide

This document outlines how the **SmartProcure Integrated Procurement Operating System (SIH26032)** operates in production after deployment on cloud infrastructure (AWS / Azure / GCP / Government NIC Cloud) and mobile app stores (Google Play Store & Apple App Store).

---


## 🏛️ Production Domain & Service Architecture

In production, local development ports (`3001`, `3010`, `3020`, `5000`) are replaced by secure HTTPS subdomains backed by SSL certificates (TLS 1.3):

```mermaid
graph TD
    subgraph Mobile_Store["📱 Mobile App Stores"]
        AndroidAPK["Google Play Store (Android APK)"]
        iOSApp["Apple App Store (iOS IPA)"]+
    end

    subgraph Production_Web_Domains["🌐 Production HTTPS Subdomains"]
        FarmerPWA["🌾 kisan.smartprocure.gov.in\n(Farmer Web App & PWA)"]
        OperatorWeb["👷 mandi.smartprocure.gov.in\n(APMC Mandi Operator Desk)"]
        AdminWeb["📊 admin.smartprocure.gov.in\n(DoCA Central Admin Portal)"]
    end

    subgraph Cloud_Infrastructure["☁️ Cloud Platform (AWS / NIC Cloud / Docker)"]
        NGINX["NGINX Reverse Proxy (Port 443 SSL)"]
        BackendCluster["🚀 api.smartprocure.gov.in\n(Node.js / Express API Cluster)"]
        MongoDBCluster[(Managed MongoDB Atlas / DocumentDB)]
        RedisCache[(Redis Queue & Session Store)]
        SMSGateway["NIC / CDAC SMS & Push Notification Gateway"]
        DBTGateway["PFMS / NPCI Aadhaar DBT Payment Gateway"]
    end

    AndroidAPK -->|HTTPS / WSS| NGINX
    iOSApp -->|HTTPS / WSS| NGINX
    FarmerPWA -->|HTTPS| NGINX
    OperatorWeb -->|HTTPS| NGINX
    AdminWeb -->|HTTPS| NGINX

    NGINX --> BackendCluster
    BackendCluster <--> MongoDBCluster
    BackendCluster <--> RedisCache
    BackendCluster --> SMSGateway
    BackendCluster --> DBTGateway
```

---

## 🌐 Environment Variable Configuration (Local vs Production)

During deployment, URLs automatically resolve to secure HTTPS domain names via environment variables:

| Component | Local Development Port | Production HTTPS Domain | Environment Variable Key |
| :--- | :--- | :--- | :--- |
| **Backend REST & WebSockets** | `http://localhost:5000` | `https://api.smartprocure.gov.in` | `VITE_API_BASE_URL` |
| **Farmer Mobile App** | `http://localhost:3001` | `https://kisan.smartprocure.gov.in` | `VITE_FARMER_APP_URL` |
| **Operator Web Portal** | `http://localhost:3010` | `https://mandi.smartprocure.gov.in` | `VITE_OPERATOR_PORTAL_URL` |
| **Admin Web Portal** | `http://localhost:3020` | `https://admin.smartprocure.gov.in` | `VITE_ADMIN_PORTAL_URL` |

---

## ☁️ Vercel One-Click Deployment & Mobile PWA Setup (Expo Go Experience)

FARMSOL is pre-configured with a Progressive Web App (PWA) manifest and Vercel build settings so that it can be deployed on Vercel and installed directly onto any smartphone (Android or iOS) like a native app.

### 1. Push to GitHub
Create an empty repository named `farmsol` on your GitHub account (`https://github.com/new`), then run:
```bash
git remote add origin https://github.com/Manikanta738674/farmsol.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Select and import the **`farmsol`** repository.
3. Keep default settings (the included `vercel.json` automatically manages the build and outputs `frontend-farmer/dist`).
4. Click **Deploy**. Vercel will generate a secure HTTPS production URL (e.g. `https://farmsol-app.vercel.app`).

### 3. Use as an App on Mobile (Like Expo Go / Native App)
1. Open the Vercel HTTPS URL in your mobile browser (**Chrome** on Android, **Safari** on iPhone).
2. **Install as App**:
   - **Android (Chrome)**: Tap the three dots menu `⋮` $\rightarrow$ **"Install app"** or **"Add to Home screen"**.
   - **iPhone (Safari)**: Tap the Share icon $\rightarrow$ **"Add to Home Screen"**.
3. Tap the **FARMSOL** app icon on your phone's home screen. The app opens in **standalone full-screen mode** without browser bars, featuring live GPS nearest mandi detection, multi-language switching (Telugu/Hindi/English), dynamic QR passes, and real-time farmer workflows!

---

## 🚀 Step-by-Step Deployment Guide

### 1. Backend API & WebSockets (`api.smartprocure.gov.in`)
Deploy the Node.js / Express backend using Docker containers or PM2 behind NGINX:

```bash
# Build Docker image for Backend
docker build -t smartprocure-backend ./backend

# Run container with production env
docker run -d -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/smartprocure" \
  -e JWT_SECRET="production-256bit-crypto-secret-key" \
  -e NODE_ENV="production" \
  smartprocure-backend
```

### 2. Farmer Mobile App (Android APK & iOS App)
Generate the standalone mobile app binaries to publish on Google Play Store and Apple App Store:

```bash
cd frontend-farmer

# 1. Build Android APK & AAB (Google Play Store)
npx eas build --platform android --profile production

# 2. Build iOS IPA (Apple App Store)
npx eas build --platform ios --profile production
```

### 3. Operator & Admin Web Portals
Build production static assets and serve via NGINX or Cloudfront CDN:

```bash
# Build production web bundles
npm run build

# NGINX block configuration for mandi.smartprocure.gov.in
server {
    listen 443 ssl http2;
    server_name mandi.smartprocure.gov.in;

    ssl_certificate /etc/letsencrypt/live/smartprocure.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartprocure.gov.in/privkey.pem;

    root /var/www/smartprocure/frontend-operator/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Production Security & Integrations

1. **Govt SMS & OTP Gateway**: Connects to CDAC SMS Seva / DLT registered templates for real OTP delivery to farmers' mobile phones.
2. **Direct Benefit Transfer (DBT)**: Connects to PFMS (Public Financial Management System) / NPCI Aadhaar Payment Bridge (APB) for direct bank transfers.
3. **SSL / TLS Encryption**: 256-bit SSL encryption on all API calls, Socket.IO WebSockets (`wss://`), and database queries.
4. **WAF & Rate Limiting**: Cloudflare / AWS WAF protects against DDoS attacks, brute force OTP attempts, and unauthorized scans.
