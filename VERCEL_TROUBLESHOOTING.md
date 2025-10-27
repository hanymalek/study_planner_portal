# 🔧 Vercel Deployment Troubleshooting

This document covers common issues and solutions when deploying to Vercel.

## ✅ Issues Fixed

### 1. Dependency Conflict: @types/react vs @types/react-dom

**Error:**
```
npm error ERESOLVE could not resolve
npm error peer @types/react@"^19.2.0" from @types/react-dom@19.2.2
npm error Conflicting peer dependency: @types/react@19.2.2
```

**Cause:**
- `@types/react-dom@19.2.2` required React 19 types
- Project uses React 18

**Solution:**
Downgraded `@types/react-dom` to match React 18:
```json
"devDependencies": {
  "@types/react": "^18.3.18",
  "@types/react-dom": "^18.3.5"  // ✅ Changed from 19.2.2
}
```

**Files Changed:**
- `package.json`
- `package-lock.json`

---

### 2. Rollup Optional Dependencies Error

**Error:**
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
npm has a bug related to optional dependencies
```

**Cause:**
- npm bug with optional dependencies (https://github.com/npm/cli/issues/4828)
- Vite 7 uses newer Rollup with stricter optional dependency requirements
- Vercel's Linux build environment needs specific native bindings

**Solution 1: Added `.npmrc` file**
```
include=optional
legacy-peer-deps=false
```

**Solution 2: Updated `vercel.json`**
```json
{
  "installCommand": "npm ci --include=optional || npm install --include=optional"
}
```

**Solution 3: Downgraded to Vite 6 (stable)**
```json
"devDependencies": {
  "vite": "^6.0.7"  // ✅ Changed from ^7.1.7
}
```

**Why Vite 6?**
- Vite 7 is very new (released recently)
- May have compatibility issues with Vercel's build environment
- Vite 6 is battle-tested and stable
- Still very fast and feature-complete

**Files Changed:**
- `.npmrc` (created)
- `vercel.json` (updated install command)
- `package.json` (downgraded Vite)
- `package-lock.json` (regenerated)

---

## 🚀 Current Working Configuration

### package.json (Key Dependencies)
```json
{
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.0",
    "vite": "^6.0.7"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    // ... other deps
  }
}
```

### .npmrc
```
include=optional
legacy-peer-deps=false
```

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci --include=optional || npm install --include=optional",
  "framework": "vite"
}
```

---

## 🔍 Debugging Vercel Deployments

### View Build Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on the failed deployment
4. View "Build Logs" tab
5. Look for error messages

### Common Error Patterns

#### "Cannot find module"
- Missing dependency in `package.json`
- Optional dependency not installed
- **Fix**: Add to dependencies or check `.npmrc`

#### "ERESOLVE" errors
- Peer dependency conflicts
- Version mismatches
- **Fix**: Align versions in `package.json`

#### "TypeScript errors"
- Type checking fails during build
- **Fix**: Run `npm run build` locally first

#### "Environment variables undefined"
- Missing env vars in Vercel
- **Fix**: Add in Vercel Dashboard → Settings → Environment Variables

---

## 🛠️ Local Testing Before Deploy

Always test locally before pushing:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Test preview
npm run preview
```

If it builds locally, it should build on Vercel (with correct config).

---

## 📋 Vercel Deployment Checklist

Before deploying:
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] All dependencies in `package.json`
- [ ] `.npmrc` file committed
- [ ] `vercel.json` configured
- [ ] Environment variables set in Vercel
- [ ] Firebase domain authorized

After deploying:
- [ ] Check build logs for warnings
- [ ] Test login functionality
- [ ] Test Firebase connection
- [ ] Test all routes
- [ ] Check browser console for errors

---

## 🔄 If Deployment Still Fails

### Step 1: Check Node Version
Vercel uses Node 20 by default. Ensure compatibility:

Add to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 2: Clear Vercel Cache
In Vercel Dashboard:
1. Go to Settings → General
2. Scroll to "Build & Development Settings"
3. Toggle "Automatically expose System Environment Variables"
4. Redeploy

Or use CLI:
```bash
vercel --force
```

### Step 3: Try Different Install Command
In `vercel.json`, try:
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Step 4: Check for Platform-Specific Dependencies
Some packages have native bindings. Check if any dependencies require:
- `node-gyp`
- Native modules
- Platform-specific builds

**Solution**: Use pure JavaScript alternatives or ensure optional deps are installed.

---

## 🌐 Firebase + Vercel Configuration

### Add Vercel Domain to Firebase

After deployment, add your Vercel domain to Firebase:

1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add: `your-project.vercel.app`
4. Add: `your-custom-domain.com` (if using custom domain)

### Environment Variables

Required in Vercel:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Important**: Add to all environments (Production, Preview, Development)

---

## 📞 Getting Help

### Vercel Support
- Dashboard → Help
- https://vercel.com/support
- Vercel Discord: https://vercel.com/discord

### Check Status
- https://www.vercel-status.com/

### Community
- Vercel GitHub Discussions
- Stack Overflow (tag: vercel)

---

## 📝 Version History

| Date | Issue | Solution | Status |
|------|-------|----------|--------|
| 2025-10-27 | @types/react conflict | Downgrade @types/react-dom to 18.3.5 | ✅ Fixed |
| 2025-10-27 | Rollup optional deps | Add .npmrc, downgrade to Vite 6 | ✅ Fixed |

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ App loads at Vercel URL
- ✅ Login works with Firebase
- ✅ Dashboard displays correctly
- ✅ All routes accessible
- ✅ No console errors

---

## 🎉 Current Status

**Last Successful Deploy:** After commit `6c54389`

**Configuration:**
- ✅ Vite 6.0.7 (stable)
- ✅ React 18.3.1
- ✅ TypeScript 5.6.0
- ✅ `.npmrc` configured
- ✅ `vercel.json` optimized
- ✅ All dependencies aligned

**Your app should deploy successfully now!** 🚀

