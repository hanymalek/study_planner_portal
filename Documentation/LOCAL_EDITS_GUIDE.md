# Local Edits & Upload Workflow

## Overview
The Study Planner Portal uses a **local-first editing** approach. Changes are saved to your browser's localStorage first, then uploaded to Firebase in batches.

## How It Works

### 1. **Import JSON Study Plans**
- Click "Import JSON" button
- Upload or paste JSON content
- Plans are validated and added to **local edits** (not Firebase yet)
- You'll see a toast: "Imported X study plans locally. Click 'Upload Changes' to save to Firebase."

### 2. **Visual Indicators**
- **Orange border** around cards with unsaved changes
- **"Not Synced" chip** on cards that need uploading
- **Warning banner** at top showing total unsaved changes count
- **"Upload Changes (X)"** button shows count of pending uploads

### 3. **Upload to Firebase**
- Click "Upload Changes" button (only enabled when there are unsaved changes)
- Confirm the upload dialog
- All local edits are batch-uploaded to Firebase
- Students will receive update notifications on their Android app

### 4. **Sync from Firebase**
- Click "Sync from Firebase" to refresh from the database
- If you have unsaved changes, you'll be warned before discarding them

## Technical Details

### localStorage Structure
```javascript
{
  "study_plan_edits": {
    "plan_id_1": { /* full StudyPlan object */ },
    "plan_id_2": { /* full StudyPlan object */ },
    ...
  }
}
```

### Version Management
- Each time you save a plan, the `version` field auto-increments
- `updatedAt` timestamp is set to current time
- Students' Android apps detect version changes and prompt for sync

## Benefits
- **Offline editing**: Work without constant Firebase connection
- **Batch uploads**: Reduce Firebase write operations (cost savings)
- **Review before publish**: See all changes before pushing to students
- **Undo capability**: Clear local edits to revert changes

## Best Practices
1. **Import first, upload later**: Import multiple plans, review them, then upload all at once
2. **Regular uploads**: Don't let too many local edits accumulate
3. **Check indicators**: Always look for the orange borders and "Not Synced" chips
4. **Confirm before sync**: Syncing from Firebase will discard local edits

## Troubleshooting

### "Upload Changes" button is disabled
- **Cause**: No local edits in localStorage
- **Solution**: Import or edit a plan first

### Plans imported but not showing as "Not Synced"
- **Cause**: localStorage not persisting (browser settings)
- **Solution**: Check browser localStorage permissions

### Lost local edits after closing browser
- **Cause**: Browser cleared localStorage
- **Solution**: Upload changes before closing, or check browser privacy settings

