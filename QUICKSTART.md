# 🚀 Quick Start Guide

Get your attendance system up and running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd attendance-system
npm install
```

## Step 2: Set Up Firebase (2 minutes)

### A. Create Firebase Project
1. Visit: https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "my-attendance-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

### B. Get Firebase Config
1. Click the web icon (</>) to add a web app
2. Register app name
3. Copy the firebaseConfig object

### C. Enable Firestore
1. Click "Firestore Database" in left menu
2. Click "Create database"
3. Choose "Test mode" (for now)
4. Select nearest location
5. Click "Enable"

## Step 3: Configure Environment (1 minute)

Create `.env.local` file in the root:

```bash
cp .env.example .env.local
```

Paste your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

```

## Step 4: Run the App!

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ You're Done!

Try it out:
1. Enter a name
2. Select a status
3. Submit
4. See it appear in the list below!

## 🎯 Next Steps

- Read the full README.md for customization options
- Add authentication for production use
- Update Firestore security rules before deploying
- Deploy to Vercel for free hosting

## ❓ Issues?

**Can't connect to Firebase?**
- Double-check your .env.local file
- Make sure all variables start with NEXT_PUBLIC_
- Restart the dev server after adding env vars

**Permission denied errors?**
- Your Firestore is in test mode (good for dev)
- Update rules before production deployment

**Need help?**
- Check the main README.md
- Visit Firebase documentation
- Check Next.js documentation
