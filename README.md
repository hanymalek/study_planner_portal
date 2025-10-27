# Study Planner Admin Portal

Web-based admin interface for managing study plans and users.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

See `FIREBASE_CONFIG.md` for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## 📋 Features

### ✅ Phase 1 (Completed)
- Authentication (Admin login)
- Dashboard with statistics
- Layout with sidebar navigation
- Firebase integration
- Local storage for draft edits

### 🚧 Coming Soon
- Study Plans management (CRUD)
- JSON import for bulk creation
- User management
- Analytics dashboard

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Material-UI (MUI)** for components
- **Firebase** (Auth + Firestore)
- **React Router** for navigation
- **React Hook Form** for forms
- **React Hot Toast** for notifications

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── StudyPlans.tsx (coming soon)
│   ├── Users.tsx (coming soon)
│   └── Analytics.tsx (coming soon)
├── services/        # API and Firebase
│   ├── firebase.ts
│   └── api.ts
├── hooks/           # Custom React hooks
│   ├── useAuth.tsx
│   └── useLocalStorage.ts
├── types/           # TypeScript definitions
│   └── index.ts
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## 🔐 Authentication

Only users with `ADMIN` role can access the portal.

To create an admin user:
1. Sign up in the Android app
2. Go to Firebase Console → Firestore
3. Find your user document in the `users` collection
4. Change the `role` field to `"ADMIN"`

## 📝 Development Workflow

1. **Sync from Firebase**: Download latest study plans
2. **Edit Locally**: All changes stored in localStorage
3. **Upload Changes**: Batch write all edits to Firestore
4. **Version Auto-Increment**: Versions increment automatically on save

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy --only hosting
```

### Vercel

```bash
npm run build
vercel --prod
```

## 📄 License

Private project for Study Planner system.

