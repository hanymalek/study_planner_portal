# 🚀 Vercel Deployment Guide

This guide will help you deploy the Study Planner Admin Portal to Vercel.

## 📋 Prerequisites

- GitHub repository with your code (✅ Already done!)
- Vercel account (free tier works great)
- Firebase project configured

## 🎯 Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

#### Step 2: Import Your Repository
1. Click "Add New..." → "Project"
2. Find `study_planner_portal` in your repository list
3. Click "Import"

#### Step 3: Configure Project Settings
Vercel will auto-detect it's a Vite project. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 4: Add Environment Variables
Click "Environment Variables" and add your Firebase config:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Your app ID |

**Important**: Add these for all environments (Production, Preview, Development)

#### Step 5: Deploy
1. Click "Deploy"
2. Wait 1-2 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy from Terminal
```bash
cd D:\github\StudyPlanner_Portal
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: study-planner-portal (or your choice)
- **Directory**: `./`
- **Override settings**: No

#### Step 4: Add Environment Variables
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

For each command, paste the value and select environments (Production, Preview, Development).

#### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## 🔧 Configuration Files

### vercel.json (Already Created)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does:**
- Tells Vercel to use Vite framework
- Configures build output directory
- Sets up SPA routing (all routes go to index.html)

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Click "Add"
4. Enter your domain (e.g., `admin.studyplanner.com`)
5. Follow DNS configuration instructions

**DNS Records to Add:**
- **Type**: A or CNAME
- **Name**: `admin` (or `@` for root domain)
- **Value**: Provided by Vercel

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Disable Auto-Deploy (Optional)
In Vercel Dashboard:
1. Go to Settings → Git
2. Toggle "Production Branch" or "Preview Deployments"

---

## 🐛 Troubleshooting

### Build Fails with "Module not found"
**Solution**: Ensure all dependencies are in `package.json`
```bash
npm install
git add package.json package-lock.json
git commit -m "fix: Update dependencies"
git push
```

### Environment Variables Not Working
**Solution**: 
1. Check variable names start with `VITE_`
2. Verify they're added to Production environment
3. Redeploy after adding variables

### 404 on Page Refresh
**Solution**: Already handled by `vercel.json` rewrites. If still occurring:
1. Check `vercel.json` is committed to git
2. Verify `rewrites` configuration is correct

### Firebase Connection Fails
**Solution**:
1. Verify all 6 environment variables are set
2. Check Firebase project is active
3. Ensure Vercel domain is added to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-project.vercel.app`)

---

## 📊 Monitoring & Analytics

### View Deployment Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. View "Build Logs" and "Function Logs"

### Performance Monitoring
Vercel provides:
- **Analytics**: Page views, unique visitors
- **Speed Insights**: Core Web Vitals
- **Real-time logs**: Errors and warnings

Access via Dashboard → Your Project → Analytics

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variable system
- ✅ Rotate Firebase keys if exposed

### 2. Firebase Security
- ✅ Add Vercel domain to Firebase authorized domains
- ✅ Keep Firestore security rules strict
- ✅ Enable App Check (optional, for extra security)

### 3. Access Control
- ✅ Only ADMIN role can access portal (already implemented)
- ✅ Use Firebase Authentication
- ✅ Implement rate limiting if needed

---

## 🚀 Deployment Workflow

### Standard Workflow
```bash
# 1. Make changes locally
git add .
git commit -m "feat: Add new feature"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically deploys
# Check deployment at https://vercel.com/dashboard
```

### Preview Deployments
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "feat: Work in progress"
git push origin feature/new-feature

# Vercel creates preview deployment
# Share preview URL with team for review
```

---

## 💰 Pricing

### Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Perfect for this project!

### Pro Tier ($20/month)
- Increased bandwidth
- Team collaboration
- Password protection
- Analytics

**For this project, the free tier is sufficient.**

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Vite on Vercel**: https://vercel.com/docs/frameworks/vite
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

---

## 📝 Quick Reference

### Deploy Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

### Environment Variables
```bash
# Add variable
vercel env add VARIABLE_NAME

# List variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME
```

---

## ✅ Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Login works with Firebase
- [ ] Dashboard displays data
- [ ] Study Plans page loads
- [ ] JSON import works
- [ ] Local edits persist
- [ ] Upload to Firebase works
- [ ] All routes work (no 404s)
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] Firebase authorized domains updated

---

## 🎉 Success!

Your Study Planner Admin Portal is now live on Vercel!

**Share your deployment URL:**
- Production: `https://your-project.vercel.app`
- Custom domain: `https://admin.studyplanner.com` (if configured)

**Next Steps:**
1. Test all features on production
2. Share URL with team
3. Set up custom domain (optional)
4. Monitor analytics and logs
5. Continue developing with automatic deployments!

