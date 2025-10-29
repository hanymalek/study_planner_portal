# Local Edits Workflow

## Overview

The Study Planner Portal uses a **local-first editing workflow** to allow admins to make changes offline and batch-upload them to Firebase when ready. This prevents accidental data loss and allows for careful review before publishing changes.

## How It Works

### 1. Local Storage

All unsaved changes are stored in the browser's `localStorage` under the key `study_plan_edits`:

```typescript
{
  "plan_id_1": { /* full plan object */ },
  "plan_id_2": { /* full plan object */ },
  // ...
}
```

### 2. Merging with Firebase Data

**Important**: When loading plans from Firebase or cache, the system **always merges** local edits with the fetched data. This ensures:

✅ Imported plans (not yet uploaded) remain visible
✅ Edited plans show your changes, not the Firebase version
✅ You never lose work when navigating between pages

**Merge Logic**:
```typescript
const mergePlansWithLocalEdits = (firebasePlans: StudyPlan[]): StudyPlan[] => {
  const localEditsData = getAllEdits();
  
  // Create a map of Firebase plans by ID
  const planMap = new Map<string, StudyPlan>();
  firebasePlans.forEach(plan => planMap.set(plan.id, plan));
  
  // Add or update with local edits (local edits take priority)
  localEditsData.forEach(editedPlan => {
    planMap.set(editedPlan.id, editedPlan);
  });
  
  return Array.from(planMap.values());
};
```

### 3. Visual Indicators

Plans with unsaved changes are marked with:
- 🟠 **Orange border** around the card
- 🔶 **"Not Synced" chip** with upload icon
- 📊 **Counter badge** in the header showing total unsaved changes

### 4. Upload Process

When you click **"Upload Changes"**:
1. All local edits are batched together
2. Uploaded to Firebase in a single transaction
3. Local edits are cleared from localStorage
4. Cache is invalidated
5. Fresh data is loaded from Firebase

## Common Workflows

### Importing Plans

1. Click **"Import JSON"**
2. Select a JSON file with study plans
3. Plans are validated and added to local state
4. Plans are **stored in localStorage** (not Firebase yet)
5. Orange border and "Not Synced" indicator appear
6. Click **"Upload Changes"** to save to Firebase

**Bug Fix**: Previously, if you imported a plan and then navigated away (e.g., by canceling an edit), the imported plan would disappear when the page reloaded from Firebase. Now, the merge logic ensures imported plans persist until uploaded.

### Editing Existing Plans

1. Click **"Edit"** on any plan card
2. Make your changes in the editor
3. Click **"Save"** (saves to localStorage only)
4. Plan shows orange border and "Not Synced" chip
5. Return to plans list - your changes are preserved
6. Click **"Upload Changes"** to save to Firebase

### Creating New Plans

1. Click **"New Plan"**
2. Fill in plan details, chapters, lessons, videos
3. Click **"Save"** (saves to localStorage only)
4. Plan appears in list with "Not Synced" indicator
5. Click **"Upload Changes"** to save to Firebase

### Syncing from Firebase

If you want to discard local changes and reload from Firebase:

1. Click **"Sync from Firebase"**
2. Confirm you want to discard unsaved changes
3. All local edits are cleared
4. Fresh data is loaded from Firebase
5. Cache is updated

**Note**: This is destructive! Only use if you want to abandon your local changes.

## Edge Cases Handled

### Case 1: Import + Cancel Edit
**Scenario**: Import a plan, start editing it, then cancel
**Result**: ✅ Plan remains visible with "Not Synced" indicator
**Reason**: Merge logic preserves local edits even after Firebase sync

### Case 2: Edit + Navigate Away
**Scenario**: Edit a plan, save locally, navigate to another page
**Result**: ✅ Changes persist when you return
**Reason**: Local edits are stored in localStorage and merged on load

### Case 3: Multiple Edits
**Scenario**: Edit multiple plans without uploading
**Result**: ✅ All edits are tracked and visible
**Reason**: Each plan ID is stored separately in localStorage

### Case 4: Cache Expiry
**Scenario**: Cache expires (5 minutes), page reloads from Firebase
**Result**: ✅ Local edits are merged with fresh Firebase data
**Reason**: Merge happens on every load, regardless of source

### Case 5: Network Failure
**Scenario**: Firebase fetch fails, falls back to stale cache
**Result**: ✅ Local edits are still merged with cached data
**Reason**: Merge logic is applied in all code paths

## Best Practices

### For Admins

1. **Review Before Upload**: Local edits allow you to review all changes before publishing
2. **Batch Changes**: Make multiple edits and upload them together
3. **Use Import for Bulk**: Import JSON for creating many plans at once
4. **Check Counter**: Always check the unsaved changes counter before leaving
5. **Upload Regularly**: Don't accumulate too many local edits

### For Developers

1. **Always Merge**: Never replace `plans` state without merging local edits
2. **Preserve on Navigation**: Ensure local edits persist across page navigations
3. **Clear on Upload**: Only clear local edits after successful Firebase upload
4. **Handle Errors**: If upload fails, keep local edits intact
5. **Test Edge Cases**: Test import + cancel, edit + navigate, etc.

## Troubleshooting

### Plans Disappearing After Navigation

**Symptom**: Imported or edited plans disappear when you navigate back to the plans list

**Cause**: `loadPlans()` was replacing state without merging local edits

**Solution**: ✅ Fixed - merge logic now applied in all load scenarios

### Unsaved Changes Counter Wrong

**Symptom**: Counter shows changes but no plans have orange borders

**Cause**: Mismatch between localStorage and component state

**Solution**: Refresh the page or click "Sync from Firebase"

### Can't Upload Changes

**Symptom**: Upload button is disabled even with local edits

**Cause**: `hasUnsavedChanges` flag not updating

**Solution**: Check browser console for errors, ensure localStorage is accessible

## Technical Details

### Storage Keys

- `study_plan_edits` - Map of plan IDs to plan objects
- `cached_study_plans` - Array of plans from Firebase
- `cached_study_plans_timestamp` - Timestamp of last Firebase fetch

### Cache Duration

- **5 minutes** - After this, data is refetched from Firebase
- Local edits are **always preserved** regardless of cache state

### Merge Priority

When a plan exists in both Firebase and local edits:
- **Local edit wins** - Your changes take priority
- Firebase version is ignored until you upload or sync

### Performance

- Merge operation is O(n) where n = number of plans
- Uses `Map` for efficient lookups
- No noticeable performance impact even with 100+ plans

## Future Enhancements

- [ ] Conflict resolution UI for simultaneous edits
- [ ] Auto-save drafts every N seconds
- [ ] Undo/redo functionality
- [ ] Diff viewer to see what changed
- [ ] Export local edits as JSON backup

