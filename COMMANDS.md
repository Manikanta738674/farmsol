# Ready-to-Run Commands & Deployment Guide
## SIH26032 - Smart Agricultural Procurement Platform

This guide provides copy-paste, ready-to-run terminal commands for developers, judges, and operators to run all modules of the SmartProcure platform (Backend API, Farmer Mobile App, Operator Web Desk, and Admin Governance Portal).

---

## 🚀 1. One-Command Full Platform Startup

From the project root directory (`c:\Users\Manikanta\OneDrive\Desktop\SmartFarmer`):

### Option A: Run via Root npm Workspaces

```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Farmer Mobile & Web App (Port 8081 / Expo Web)
npm run dev:farmer

# Terminal 3: Start Mandi Operator Web Desk (Port 3010)
npm run dev:operator

# Terminal 4: Start DoCA Admin Governance Portal (Port 3020)
npm run dev:admin
```

---

## 🌾 2. Farmer Mobile & Web Application (`frontend-farmer`)

Directory: `frontend-farmer/`

### 2.1 Web App Preview (Browser Mode)
Runs the farmer mobile interface inside any desktop/mobile browser:

```bash
cd frontend-farmer
npm run web
```
> **URL**: `http://localhost:8081` or `http://localhost:5173`

### 2.2 Expo Native Mobile Development (Physical Phone / Expo Go)
Starts the Metro bundler and generates a scannable QR Code for Expo Go app:

```bash
cd frontend-farmer
npx expo start
```

### 2.3 Remote Device Access via Tunnel (Overcomes Firewall / Wi-Fi Isolation)
Use this command if testing on physical mobile phones across different Wi-Fi networks:

```bash
cd frontend-farmer
npm run tunnel
```

### 2.4 Android Emulator Deployment
Launches the app directly inside an active Android Studio Emulator:

```bash
cd frontend-farmer
npm run android
```

---

## 🏢 3. Mandi Operator Web Desk (`frontend-operator`)

Directory: `frontend-operator/`

Starts the APMC Mandi Gate Operator Web Portal for QR Code Scanning, Token Check-in, Moisture/Quality Assaying, and Electronic Weighbridge entry.

```bash
cd frontend-operator
npm run dev
```
> **URL**: [http://localhost:3010](http://localhost:3010)

---

## 🏛️ 4. DoCA Admin Governance Portal (`frontend-admin`)

Directory: `frontend-admin/`

Starts the Ministry of Consumer Affairs (DoCA) National Governance Portal for Live MSP Updates, Mandi Procurement Capacity Management, Operator Verifications, and Audit Logs.

```bash
cd frontend-admin
npm run dev
```
> **URL**: [http://localhost:3020](http://localhost:3020)

---

## ⚙️ 5. Backend Service & Database Seed (`backend`)

Directory: `backend/`

### 5.1 Seed Initial MSP & Procurement Data
Populates official DoCA 2026 Guaranteed MSP crop rates, sample APMC mandi locations, and test accounts:

```bash
cd backend
npm run seed
```

### 5.2 Start Backend API Server
Runs the Node.js / Express REST & Socket.IO server:

```bash
cd backend
npm run dev
```
> **API Endpoint**: `http://localhost:5000/api/v1`

---

## 📲 6. Android Emulator Port Forwarding & Troubleshooting

If backend API requests or Expo Metro connections fail on Android Emulators or physical devices connected via USB, run the following `adb` port reverse commands:

```bash
# Reverse Metro Bundler Port
adb reverse tcp:8081 tcp:8081

# Reverse Backend API Port
adb reverse tcp:5000 tcp:5000

# Reverse Operator Web Desk Port
adb reverse tcp:3010 tcp:3010
```

---

## 🏗️ 7. Production Build Verification

To verify typescript compilation and build production bundles across all packages:

```bash
# From Root Directory
npm run build
```

Or build individual workspaces:

```bash
# Build Farmer App
cd frontend-farmer && npm run build

# Build Operator Desk
cd frontend-operator && npm run build

# Build Admin Portal
cd frontend-admin && npm run build
```

---

## 📊 Summary of Active Service Ports

| Service / App | Platform | Port | Default URL |
| :--- | :--- | :--- | :--- |
| **Farmer Mobile & Web App** | React / Expo | `8081` | [http://localhost:8081](http://localhost:8081) |
| **Mandi Operator Web Desk** | Vite / React | `3010` | [http://localhost:3010](http://localhost:3010) |
| **DoCA Admin Governance** | Vite / React | `3020` | [http://localhost:3020](http://localhost:3020) |
| **Backend REST & Sockets** | Express / TS | `5000` | [http://localhost:5000](http://localhost:5000) |
