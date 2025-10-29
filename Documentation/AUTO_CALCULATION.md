# Auto-Calculation Features

## Video Minutes Auto-Calculation

The **Video Minutes** field in each lesson is automatically calculated based on the total duration of all videos in that lesson. This ensures accuracy and eliminates manual entry errors.

### How It Works

1. **Automatic Updates**: The system monitors all videos in a lesson and recalculates the total duration whenever:
   - A video is added or removed
   - A video's duration is changed manually
   - YouTube video information is fetched (which includes duration)

2. **Calculation Method**:
   ```typescript
   totalVideoSeconds = sum of all video.durationSeconds
   estimatedMinutes = Math.ceil(totalVideoSeconds / 60)
   ```
   - The result is rounded up to the nearest minute
   - Example: 725 seconds = 13 minutes (not 12.08)

3. **Read-Only Field**: The Video Minutes field is displayed as read-only with:
   - Gray background to indicate it's not editable
   - Helper text: "Auto-calculated from video durations"
   - Cursor changes to "not-allowed" on hover

### User Workflow

#### Adding a New Video
1. Click "Add Video" in a lesson
2. Paste YouTube URL or enter video details
3. For YouTube videos, click "Fetch Info" to auto-populate duration
4. **Video Minutes updates automatically**

#### Editing Video Duration
1. Open a video editor
2. Change the "Duration (seconds)" field
3. **Video Minutes updates immediately** when you save

#### Fetching YouTube Info
1. Paste a YouTube URL in the video editor
2. Click "Fetch Info" button
3. Title, thumbnail, and duration are populated
4. **Video Minutes updates automatically** with the new duration

### Practice Minutes

Unlike Video Minutes, **Practice Minutes** remains manually editable because:
- Practice time varies based on lesson difficulty
- Instructors may want different practice durations
- Default value is 60 minutes but can be customized per lesson

### Benefits

✅ **Accuracy**: No manual calculation errors
✅ **Efficiency**: Saves time when adding/editing videos
✅ **Consistency**: All lessons follow the same calculation method
✅ **Real-time**: Updates happen instantly as you work

### Technical Implementation

The auto-calculation is implemented using React's `useEffect` hook:

```typescript
useEffect(() => {
  const totalVideoSeconds = lesson.videos.reduce(
    (sum, video) => sum + (video.durationSeconds || 0), 
    0
  );
  const totalVideoMinutes = Math.ceil(totalVideoSeconds / 60);
  
  if (totalVideoMinutes !== lesson.estimatedMinutes) {
    onUpdate({ ...lesson, estimatedMinutes: totalVideoMinutes });
  }
}, [lesson.videos]);
```

This ensures the calculation runs whenever the videos array changes, but only updates if the value actually changed (to prevent infinite loops).

### Sample Data

In `sample_study_plan.json`, ensure that `estimatedMinutes` matches the sum of video durations:

```json
{
  "estimatedMinutes": 12,
  "videos": [
    { "durationSeconds": 300 },  // 5 minutes
    { "durationSeconds": 420 }   // 7 minutes
  ]
  // Total: 720 seconds = 12 minutes ✓
}
```

### Notes

- The field is still stored in Firestore (for backward compatibility and caching)
- When importing JSON, the `estimatedMinutes` value should match video durations
- The Android app will also use this calculated value for scheduling

