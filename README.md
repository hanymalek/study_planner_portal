# 📚 Study Planner Admin Portal

A modern web-based admin interface for managing study plans in the Study Planner system. Built with React, TypeScript, and Firebase.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4-orange.svg)](https://firebase.google.com/)
[![Material-UI](https://img.shields.io/badge/MUI-7.3-blue.svg)](https://mui.com/)

## ✨ Features

### 📋 Study Plan Management
- ✅ Create, edit, and organize comprehensive study plans
- ✅ Hierarchical structure: Plans → Chapters → Lessons → Videos
- ✅ Support for multiple video types (YouTube, Local, URL)
- ✅ Automatic version tracking for updates
- ✅ Visual indicators for unsaved changes

### 📥 JSON Import/Export
- ✅ Bulk import study plans from JSON files
- ✅ Validation and error reporting
- ✅ Preview before importing
- ✅ Sample data included

### 💾 Local-First Editing
- ✅ Edit plans locally before syncing to Firebase
- ✅ Visual indicators for unsaved changes (orange borders)
- ✅ Batch upload to reduce Firebase costs
- ✅ Undo capability by clearing local edits

### 👥 User Management
- 🚧 Manage student and admin accounts (coming soon)
- 🚧 Email-based invitations (coming soon)
- 🚧 Role assignment (ADMIN/STUDENT) (coming soon)

### 📊 Analytics Dashboard
- ✅ Basic statistics (total plans, users, students)
- 🚧 Student progress tracking (coming soon)
- 🚧 Filter by username (coming soon)
- 🚧 Completion rates and streaks (coming soon)

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Backend**: Firebase (Authentication & Firestore)
- **Build Tool**: Vite 7
- **Routing**: React Router DOM v7
- **State Management**: Custom hooks + localStorage
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with:
  - Authentication enabled (Email/Password)
  - Firestore Database created
  - Security rules configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hanymalek/study_planner_portal.git
   cd study_planner_portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   See [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) for detailed setup instructions.

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**
   ```bash
   npm run build
   ```
   
   Output will be in the `dist/` directory.

## 📖 Documentation

- **[Firebase Configuration Guide](./FIREBASE_CONFIG.md)** - Set up Firebase project and environment variables
- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Deploy to Vercel in minutes
- **[Local Edits Workflow](./LOCAL_EDITS_GUIDE.md)** - How to use the local-first editing system
- **[Build Configuration](./BUILD_CONFIGURATION.md)** - Vite configuration and optimization details
- **[Setup Complete Guide](./SETUP_COMPLETE.md)** - Comprehensive setup walkthrough
- **[Study Plans Page Guide](./STUDY_PLANS_PAGE_COMPLETE.md)** - Using the study plans interface

## 📁 Project Structure

```
study_planner_portal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   ├── StudyPlanCard.tsx
│   │   └── JsonImportDialog.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication context
│   │   └── useLocalStorage.ts
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── StudyPlans.tsx
│   ├── services/            # API and Firebase services
│   │   ├── firebase.ts      # Firebase initialization
│   │   └── api.ts           # Firestore operations
│   └── types/               # TypeScript type definitions
│       └── index.ts
├── public/                  # Static assets
├── dist/                    # Production build output
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env                    # Environment variables (not committed)
```

## 🎯 Key Workflows

### Import Study Plans
1. Click "Import JSON" button
2. Upload or paste JSON content
3. Review validation warnings
4. Plans are saved locally (not Firebase yet)
5. Click "Upload Changes" to sync to Firebase

### Edit Study Plans (Coming Soon)
1. Navigate to Study Plans page
2. Click edit icon on a plan card
3. Make changes in the editor
4. Changes saved locally automatically
5. Upload when ready

### Manage Users (Coming Soon)
1. Navigate to Users page
2. Add user by email
3. Assign role (ADMIN/STUDENT)
4. User receives invitation email

## 🔐 Security

- Firebase Security Rules enforce access control
- Admin-only write access to study plans
- Users can only read their own progress
- Environment variables for sensitive data
- `.env` file excluded from git

## 🔐 Authentication

Only users with `ADMIN` role can access the portal.

**To create an admin user:**
1. Sign up in the Android app (or use Firebase Console)
2. Go to Firebase Console → Firestore
3. Find your user document in the `users` collection
4. Change the `role` field to `"ADMIN"`
5. Log in to the portal with your credentials

## 🚢 Deployment

### Vercel (Recommended) ⚡

**Easiest and fastest deployment option!**

1. Push your code to GitHub (✅ Already done!)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" and select `study_planner_portal`
4. Add your Firebase environment variables
5. Click "Deploy" - Done in 2 minutes! 🎉

**See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed step-by-step guide.**

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize hosting:
   ```bash
   firebase init hosting
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Other Platforms

The `dist/` folder can be deployed to:
- ✅ **Vercel** (Recommended - see guide above)
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

## 🐛 Troubleshooting

### Build Warnings
All MUI "use client" warnings are suppressed in `vite.config.ts`. If you see warnings, ensure the config file exists.

### Firebase Connection Issues
1. Check `.env` file has correct values
2. Verify Firebase project is active
3. Check browser console for errors

### Local Edits Not Persisting
1. Check browser localStorage permissions
2. Clear browser cache and try again
3. Ensure you're not in incognito/private mode

### Upload Changes Button Disabled
- Import or edit a plan first to enable the button
- Check for orange borders on plan cards (indicates unsaved changes)

## 🤝 Contributing

This is a private project. For questions or issues, contact the repository owner.

## 📄 License

Private - All Rights Reserved

## 🔗 Related Projects

- [Study Planner Android App](https://github.com/hanymalek/StudyPlanner) - Student-facing mobile application

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Firebase**
