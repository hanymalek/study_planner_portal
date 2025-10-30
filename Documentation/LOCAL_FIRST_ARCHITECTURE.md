# Local-First Architecture

## Overview

The Study Planner Portal has been refactored to be **fully local-first**. All data is stored in `localStorage` by default, and Firebase is only accessed when explicitly syncing via the Upload or Sync buttons.

## Key Changes

### 1. API Layer (`src/services/api.ts`)

All API functions now follow this pattern:

- **Default behavior**: Read/write from `localStorage` (instant, no network calls)
- **Explicit sync**: Pass `syncWithFirebase = true` to force Firebase operations
- **Versioning**: Local storage includes version tracking for future migrations

#### Main Functions

```typescript
// Local by default, sync optional
getAllStudyPlans(syncWithFirebase = false)
getStudyPlan(id, syncWithFirebase = false)
saveStudyPlan(plan, syncToFirebase = false)
deleteStudyPlan(id, syncToFirebase = false)

// User management
getAllUsers(syncWithFirebase = false)
getUser(id, syncWithFirebase = false)

// Progress - purely local
getUserProgress(userId, scheduleId)
saveUserProgress(userId, scheduleId, progress)
getUserProgressForPlan(userId, studyPlanId)

// Schedules - purely local
getSchedulesByStudyPlanId(studyPlanId, userId?)
saveSchedule(schedule)
syncSchedulesFromFirebase(userId?)
```

### 2. Storage Keys

All local storage uses versioned keys:

- `storage_version` - Current version (1)
- `local_study_plans` - All study plans
- `local_users` - All users
- `local_schedules` - All schedules
- `user_progress_{userId}__{scheduleId}` - User progress per schedule

### 3. Pages Updated

#### StudyPlans Page
- Loads from local storage instantly on page load
- "Sync from Firebase" button explicitly downloads from Firebase
- "Upload Changes" button explicitly uploads to Firebase
- All edits are local by default

#### PlanDetails Page
- Instantly loads plan and progress from local storage
- No Firebase calls
- Shows progress even if not synced to cloud

#### Users Page
- Loads from local storage by default
- "Sync from Firebase" button explicitly downloads users

#### Dashboard Page
- Loads stats from local storage instantly
- No Firebase calls on page load

#### PlanEditor Page
- Loads plans from local storage instantly
- All edits are local until explicitly saved

### 4. User Experience

**Before:**
- Loading spinners on every page navigation
- Automatic Firebase calls
- Network delays

**After:**
- Instant page loads from local storage
- No loading spinners (except initial sync)
- Explicit sync control via buttons
- Works offline

### 5. Sync Workflow

1. **Initial Setup**: Click "Sync from Firebase" to download data
2. **Daily Work**: All changes are local (instant)
3. **Upload**: Click "Upload Changes" when ready to sync to Firebase
4. **Download**: Click "Sync from Firebase" to get latest changes from other admins

### 6. Data Flow

```
┌─────────────┐
│ Local       │
│ Storage     │ ← Default read/write (instant)
└─────────────┘
      ↕
      ↕ Explicit sync only
      ↕
┌─────────────┐
│ Firebase    │
│ Firestore   │ ← Only when user clicks sync buttons
└─────────────┘
```

### 7. Benefits

✅ **Instant page loads** - No network delays
✅ **Offline capable** - Works without internet
✅ **Explicit sync** - User controls when to upload/download
✅ **Versioned storage** - Future-proof for migrations
✅ **Local edits** - Safe to experiment without affecting cloud
✅ **Better UX** - No unexpected loading spinners

### 8. Helper Functions

```typescript
// Clear all local data (useful for reset/testing)
clearAllLocalData()

// Export progress for backup
saveProgressLocally(userId, scheduleId, progress)
```

### 9. Migration Notes

- Old cache keys (`cached_study_plans`, `cached_study_plans_timestamp`) are no longer used
- All data now uses the new versioned storage system
- First load after update will show empty data until first sync

### 10. Future Enhancements

- Add version migration logic when storage version changes
- Add export/import functionality for backup
- Add conflict resolution for simultaneous edits
- Add last sync timestamp display

## Testing

To test the local-first behavior:

1. Open DevTools → Application → Local Storage
2. Verify data is stored with `local_` prefix
3. Navigate between pages - should be instant
4. Disconnect internet - app should still work
5. Click "Sync from Firebase" - should connect and download
6. Make edits - should be instant
7. Click "Upload Changes" - should connect and upload

