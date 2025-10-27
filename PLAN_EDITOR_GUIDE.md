# 📝 Study Plan Editor Guide

Complete guide to creating and editing study plans in the admin portal.

## 🎯 Overview

The Study Plan Editor provides a comprehensive interface for creating and managing study plans with a hierarchical structure:

**Study Plan** → **Chapters** → **Lessons** → **Videos**

## 🚀 Getting Started

### Access the Editor

1. **Create New Plan:**
   - Navigate to "Study Plans" page
   - Click "New Plan" button
   - Or go to `/plans/new`

2. **Edit Existing Plan:**
   - Navigate to "Study Plans" page
   - Click edit icon on a plan card
   - Or go to `/plans/:planId/edit`

## 📋 Plan Structure

### 1. Basic Information

**Required Fields:**
- **Plan Name**: e.g., "Introduction to Physics"
- **Subject Name**: e.g., "Physics"

**Optional Fields:**
- **Exam Board**: e.g., "IGCSE", "A-Level"
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Description**: Brief overview of the plan

### 2. Chapters

Each plan contains one or more chapters.

**Chapter Fields:**
- **Name**: e.g., "Chapter 1: Mechanics"
- **Description**: Brief overview
- **Order**: Automatically managed (1, 2, 3...)

**Chapter Actions:**
- ⬆️ **Move Up**: Reorder chapter
- ⬇️ **Move Down**: Reorder chapter
- 🗑️ **Delete**: Remove chapter (with confirmation)
- ➕ **Add Lesson**: Create new lesson in this chapter

### 3. Lessons

Each chapter contains one or more lessons.

**Lesson Fields:**
- **Name**: e.g., "Newton's Laws of Motion"
- **Description**: Brief overview
- **Estimated Duration**: Time in minutes
- **Order**: Automatically managed

**Lesson Actions:**
- ⬆️ **Move Up**: Reorder lesson
- ⬇️ **Move Down**: Reorder lesson
- 🗑️ **Delete**: Remove lesson (with confirmation)
- ➕ **Add Video**: Create new video in this lesson

### 4. Videos

Each lesson contains one or more videos.

**Video Fields:**
- **Title**: e.g., "Introduction to Newton's First Law"
- **Video Type**: YouTube, Local File, or Direct URL
- **Category**: Lesson, Practice, Quiz, or Review
- **Duration**: Time in seconds
- **Resource URL/ID**: 
  - YouTube: Video ID only (e.g., `dQw4w9WgXcQ`)
  - Local: File path (e.g., `/videos/lesson1.mp4`)
  - URL: Full URL (e.g., `https://example.com/video.mp4`)
- **Thumbnail URL**: Optional custom thumbnail

**Video Actions:**
- ⬆️ **Move Up**: Reorder video
- ⬇️ **Move Down**: Reorder video
- 🗑️ **Delete**: Remove video (with confirmation)

## 🎨 User Interface

### Nested Accordions

The editor uses a nested accordion structure for easy navigation:

```
📘 Study Plan
  └─ 📖 Chapter 1
      ├─ 📄 Lesson 1
      │   ├─ 🎥 Video 1
      │   ├─ 🎥 Video 2
      │   └─ 🎥 Video 3
      └─ 📄 Lesson 2
          └─ 🎥 Video 1
```

**Expand/Collapse:**
- Click chapter header to expand/collapse lessons
- Click lesson header to expand/collapse videos
- Work on one section at a time for clarity

### Visual Indicators

- **Chips**: Show counts (e.g., "3 lessons", "5 videos")
- **Order Numbers**: Display hierarchy (e.g., "1.1", "1.2")
- **Icons**: Indicate video type (YouTube, Local, URL)
- **Colors**: Differentiate sections

## 💾 Saving Your Work

### Local Save

1. Click "Save Locally" button
2. Plan is saved to browser's localStorage
3. You'll see a success message
4. **Orange border** appears on plan card
5. **"Not Synced" chip** shows on card

**Benefits:**
- Work offline
- Review before publishing
- Batch multiple changes

### Upload to Firebase

1. Go to "Study Plans" page
2. See unsaved changes count in banner
3. Click "Upload Changes" button
4. Confirm the upload
5. Plans sync to Firebase
6. Students receive update notifications

**Important:**
- Always upload when done editing
- Local changes persist until uploaded
- Clear local edits to discard changes

## 📝 Best Practices

### 1. Plan Structure

- **Logical Order**: Arrange chapters/lessons logically
- **Clear Names**: Use descriptive, specific names
- **Consistent Numbering**: Let the system handle order numbers
- **Balanced Content**: Aim for similar chapter sizes

### 2. Lesson Design

- **Focused Topics**: One main concept per lesson
- **Reasonable Duration**: 20-60 minutes per lesson
- **Multiple Videos**: Break long content into shorter videos
- **Mix Content Types**: Combine lessons, practice, and quizzes

### 3. Video Organization

- **Descriptive Titles**: Clearly describe video content
- **Accurate Duration**: Set correct duration for progress tracking
- **Proper Categories**:
  - **Lesson**: Teaching content
  - **Practice**: Example problems
  - **Quiz**: Assessment videos
  - **Review**: Summary/recap
- **YouTube IDs**: Use only the ID, not full URL

### 4. Workflow

1. **Draft Locally**: Create/edit without publishing
2. **Review**: Check all fields for accuracy
3. **Test**: Verify video IDs work
4. **Upload**: Publish when ready
5. **Monitor**: Check student feedback

## 🔧 Advanced Features

### Reordering Content

**Drag-Free Reordering:**
- Use ⬆️ and ⬇️ buttons to move items
- Order numbers update automatically
- Changes save with the plan

**Tips:**
- Reorder chapters for better flow
- Group related lessons together
- Put foundational content first

### Bulk Operations

**Multiple Chapters:**
- Add all chapters first
- Fill in details later
- Reorder as needed

**Multiple Lessons:**
- Create lesson structure first
- Add videos incrementally
- Test as you go

### Validation

**Required Fields:**
- Plan name and subject are required
- At least one chapter required
- Each chapter needs at least one lesson
- Each lesson needs at least one video

**Automatic Checks:**
- Empty fields highlighted
- Missing data prevents save
- Clear error messages

## 🎯 Example Workflow

### Creating a New Plan

1. **Start:**
   - Click "New Plan"
   - Enter plan name: "Introduction to Physics"
   - Set subject: "Physics"
   - Choose difficulty: "Beginner"

2. **Add Chapter:**
   - Click "Add Chapter"
   - Name: "Chapter 1: Mechanics"
   - Description: "Introduction to motion and forces"

3. **Add Lesson:**
   - Expand chapter
   - Click "Add Lesson"
   - Name: "Newton's Laws"
   - Duration: 45 minutes

4. **Add Videos:**
   - Expand lesson
   - Click "Add Video" (3 times)
   - Video 1: "Newton's First Law" (YouTube)
   - Video 2: "Newton's Second Law" (YouTube)
   - Video 3: "Practice Problems" (YouTube, Practice category)

5. **Save:**
   - Click "Save Locally"
   - Review on Study Plans page
   - Click "Upload Changes"

### Editing an Existing Plan

1. **Load Plan:**
   - Go to Study Plans page
   - Click edit icon on plan card
   - Plan loads with all content

2. **Make Changes:**
   - Add new chapter at end
   - Reorder lessons in chapter 2
   - Update video durations
   - Fix video IDs

3. **Save:**
   - Click "Save Locally"
   - Changes stored in browser
   - Upload when ready

## 🐛 Troubleshooting

### Plan Won't Save

**Issue**: "Plan name is required" error
**Solution**: Fill in all required fields (name, subject)

**Issue**: "At least one chapter is required"
**Solution**: Add at least one chapter with one lesson

### Videos Not Playing

**Issue**: YouTube videos don't work
**Solution**: 
- Use only the video ID, not full URL
- Example: `dQw4w9WgXcQ` not `https://youtube.com/watch?v=dQw4w9WgXcQ`

### Changes Not Appearing

**Issue**: Edits don't show on Study Plans page
**Solution**: 
- Click "Save Locally" first
- Refresh the page
- Check for orange border on card

### Lost Changes

**Issue**: Closed browser, lost work
**Solution**:
- Changes saved in localStorage persist
- Reopen browser and check Study Plans page
- Look for "Not Synced" chips

## 📊 Statistics

After creating a plan, you'll see:
- Total chapters count
- Total lessons count
- Total videos count
- Estimated total duration
- Version number
- Last updated date

## 🔗 Related Features

- **JSON Import**: Bulk create plans from JSON
- **Study Plans List**: View and manage all plans
- **Local Edits**: Track unsaved changes
- **Version Control**: Automatic version incrementing

## 💡 Tips & Tricks

1. **Save Often**: Click "Save Locally" frequently
2. **Use Descriptions**: Help students understand content
3. **Consistent Naming**: Use clear, predictable names
4. **Test Videos**: Verify all video IDs before uploading
5. **Batch Changes**: Make multiple edits before uploading
6. **Review Before Upload**: Check everything is correct
7. **Monitor Feedback**: Ask students about plan quality

## 📧 Need Help?

If you encounter issues:
1. Check this guide
2. Review error messages
3. Check browser console for errors
4. Contact support with details

---

**Happy Planning!** 🎓

