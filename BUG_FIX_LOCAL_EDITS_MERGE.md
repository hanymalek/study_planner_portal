# Bug Fix: Local Edits Lost on Navigation

## Issue Description

**Reported Bug**: When importing a JSON study plan and then canceling an edit (navigating back to the StudyPlans page), the imported plan would disappear from the list even though it showed as "1 change not synced" in the header.

### Reproduction Steps

1. Import a study plan from JSON
2. Plan appears in the list with orange border and "Not Synced" chip
3. Click "Edit" on the plan
4. Click "Cancel" to go back to the plans list
5. **BUG**: Plan disappears from the list
6. Header still shows "1 change not synced"
7. Sync button is active but the plan is not visible

### Root Cause

The `loadPlans()` function was completely replacing the `plans` state with data from Firebase or cache, without considering plans that existed only in local edits (localStorage).

**Before (Buggy Code)**:
```typescript
const loadPlans = async (forceRefresh = false) => {
  // ... fetch from cache or Firebase ...
  const fetchedPlans = await getAllStudyPlans();
  
  // ❌ This overwrites everything, losing local-only plans
  setPlans(fetchedPlans);
};
```

When you navigated back to the StudyPlans page:
1. Component re-mounted or re-rendered
2. `loadPlans()` was called (from cache or Firebase)
3. Firebase had 0 plans (empty database)
4. `setPlans([])` cleared the imported plan from state
5. Plan disappeared from UI
6. But localStorage still had the edit, so counter showed "1 change"

## Solution

Implemented a **merge strategy** that combines Firebase/cache data with local edits, ensuring local edits always take priority.

**After (Fixed Code)**:
```typescript
// Helper function to merge Firebase plans with local edits
const mergePlansWithLocalEdits = (firebasePlans: StudyPlan[]): StudyPlan[] => {
  const localEditsData = getAllEdits() as StudyPlan[];
  
  // Create a map of Firebase plans by ID
  const planMap = new Map<string, StudyPlan>();
  firebasePlans.forEach(plan => planMap.set(plan.id, plan));
  
  // Add or update with local edits (local edits take priority)
  localEditsData.forEach(editedPlan => {
    planMap.set(editedPlan.id, editedPlan);
  });
  
  return Array.from(planMap.values());
};

const loadPlans = async (forceRefresh = false) => {
  // ... fetch from cache or Firebase ...
  const fetchedPlans = await getAllStudyPlans();
  
  // ✅ Merge with local edits before setting state
  const mergedPlans = mergePlansWithLocalEdits(fetchedPlans);
  setPlans(mergedPlans);
};
```

### Merge Logic

The merge uses a `Map` to efficiently combine plans:

1. **Start with Firebase plans**: Add all plans from Firebase/cache to a Map (keyed by plan ID)
2. **Overlay local edits**: For each local edit, add or replace in the Map
3. **Local edits win**: If a plan exists in both, the local version takes priority
4. **New plans preserved**: Plans that only exist locally (e.g., imported but not uploaded) are included

### Applied Everywhere

The merge logic is now applied in **all code paths** where plans are loaded:

1. ✅ Loading from cache (within TTL)
2. ✅ Loading from Firebase (forced refresh)
3. ✅ Fallback to stale cache (on error)

## Testing

### Test Case 1: Import + Cancel Edit
```
1. Import JSON with 1 plan
2. Plan appears with "Not Synced" indicator
3. Click "Edit" on the plan
4. Click "Cancel" to go back
5. ✅ Plan is still visible
6. ✅ "Not Synced" indicator still shows
7. ✅ Can upload to Firebase successfully
```

### Test Case 2: Import + Navigate Away + Return
```
1. Import JSON with 1 plan
2. Navigate to Dashboard
3. Navigate back to Study Plans
4. ✅ Plan is still visible
5. ✅ "Not Synced" indicator still shows
```

### Test Case 3: Edit Existing + Sync from Firebase
```
1. Upload a plan to Firebase
2. Edit the plan locally (change name)
3. Click "Sync from Firebase"
4. Confirm discard changes
5. ✅ Local edit is cleared
6. ✅ Original plan from Firebase is shown
```

### Test Case 4: Multiple Local Edits
```
1. Import 2 plans (Plan A, Plan B)
2. Edit Plan A (change name)
3. Navigate to Dashboard and back
4. ✅ Both plans are visible
5. ✅ Plan A shows edited name
6. ✅ Counter shows "2 changes"
```

### Test Case 5: Cache Expiry
```
1. Import 1 plan
2. Wait 6 minutes (cache expires)
3. Refresh page
4. ✅ Plan is still visible (merged with fresh Firebase data)
5. ✅ "Not Synced" indicator still shows
```

## Impact

### User Experience
- ✅ **No more lost work**: Imported or edited plans never disappear
- ✅ **Consistent state**: What you see matches what's in localStorage
- ✅ **Reliable workflow**: Can safely navigate between pages
- ✅ **Clear indicators**: Orange borders and counters always accurate

### Code Quality
- ✅ **Single source of truth**: localStorage is the authority for unsaved changes
- ✅ **Defensive programming**: Merge happens in all load scenarios
- ✅ **No special cases**: Same logic for cache, Firebase, and error fallback
- ✅ **Efficient**: O(n) merge using Map, no performance impact

## Files Changed

1. **src/pages/StudyPlans.tsx**
   - Added `mergePlansWithLocalEdits()` helper function
   - Updated `loadPlans()` to merge in all code paths
   - Applied merge in cache load, Firebase load, and error fallback

2. **Documentation/LOCAL_EDITS_WORKFLOW.md** (NEW)
   - Comprehensive guide to local edits workflow
   - Explains merge logic and priority
   - Documents edge cases and best practices

3. **BUG_FIX_LOCAL_EDITS_MERGE.md** (THIS FILE)
   - Documents the bug and fix
   - Provides test cases
   - Explains technical implementation

## Related Issues

This fix also resolves potential issues with:
- Plans edited locally but not uploaded
- Plans created locally (via "New Plan" button)
- Plans duplicated locally
- Any scenario where localStorage has data not in Firebase

## Lessons Learned

1. **Always merge, never replace**: When dealing with local-first workflows, always merge local state with remote state
2. **Test navigation**: Edge cases often appear when navigating between pages
3. **Consistent patterns**: Apply the same logic in all code paths (cache, Firebase, error)
4. **Document workflows**: Complex state management needs clear documentation
5. **User feedback matters**: This bug was caught by user testing, not automated tests

## Future Improvements

- [ ] Add unit tests for merge logic
- [ ] Add integration tests for navigation scenarios
- [ ] Consider using a state management library (Zustand/Redux) for complex state
- [ ] Add visual diff viewer to show local vs. Firebase changes
- [ ] Implement conflict resolution for simultaneous edits by multiple admins

## Conclusion

This fix ensures that the local-first editing workflow works reliably in all scenarios. Users can now import plans, edit them, navigate between pages, and upload when ready without fear of losing their work.

The merge strategy is simple, efficient, and defensive - it handles all edge cases by always prioritizing local edits over remote data.

