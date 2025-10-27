# Firebase Configuration Guide

## Setup Instructions

1. **Create a `.env.local` file** in the root of the project (StudyPlanner_Portal/)

2. **Add the following environment variables:**

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon (⚙️) → Project Settings
   - Scroll down to "Your apps" section
   - Click "Add app" → Select Web (</>) if you haven't added a web app yet
   - Copy the config values from the `firebaseConfig` object

4. **Save the `.env.local` file** and restart the development server

## Example Config

```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuv
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## Security Notes

- ✅ The `.env.local` file is already in `.gitignore` and will NOT be committed
- ✅ These are safe to use in client-side code (they're meant to be public)
- ✅ Security is handled by Firebase Security Rules, not by hiding these values

