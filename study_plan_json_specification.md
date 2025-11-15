# Study Plan JSON Specification

This document outlines the JSON structure required for creating and managing study plans in the Study Planner system.

## Overview

A study plan is a structured learning path organized into chapters, lessons, and associated video resources. The JSON structure supports hierarchical organization with metadata for tracking and management.

## Root Level Structure

```json
{
  "id": "string",
  "name": "string",
  "subjectName": "string",
  "description": "string",
  "examBoardId": "string",
  "difficulty": "string",
  "version": "number",
  "isDeleted": "boolean",
  "createdAt": "number",
  "updatedAt": "number",
  "createdBy": "string",
  "chapters": "Chapter[]"
}
```

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier for the study plan | `"physics_101"` |
| `name` | string | Display name of the study plan | `"Introduction to Physics"` |
| `subjectName` | string | Subject category | `"Physics"` |
| `description` | string | Brief description of the plan | `"Basic physics concepts for beginners"` |
| `examBoardId` | string | Exam board identifier | `"TEST"`, `"IGCSE"`, `"A_LEVEL"` |
| `difficulty` | string | Difficulty level | `"beginner"`, `"intermediate"`, `"advanced"` |
| `version` | number | Version number for tracking changes | `1` |
| `isDeleted` | boolean | Soft delete flag | `false` |
| `createdAt` | number | Unix timestamp in milliseconds | `1729900000000` |
| `updatedAt` | number | Unix timestamp in milliseconds | `1729900000000` |
| `createdBy` | string | User ID of creator | `"admin"`, `"user123"` |
| `chapters` | array | Array of chapter objects | See Chapter structure below |

## Chapter Structure

Each chapter represents a major topic division within the study plan.

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "order": "number",
  "lessons": "Lesson[]"
}
```

### Chapter Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier for the chapter | `"chapter_001"` |
| `name` | string | Chapter title | `"Chapter 1: Mechanics"` |
| `description` | string | Chapter description | `"Introduction to mechanics and motion"` |
| `order` | number | Display order within the study plan | `1` |
| `lessons` | array | Array of lesson objects | See Lesson structure below |

## Lesson Structure

Lessons are the core learning units containing video resources and metadata.

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "order": "number",
  "estimatedMinutes": "number",
  "practiceMinutes": "number",
  "difficulty": "string",
  "prerequisites": "string[]",
  "videos": "Video[]"
}
```

### Lesson Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier for the lesson | `"lesson_001"` |
| `name` | string | Lesson title | `"Newton's Laws of Motion"` |
| `description` | string | Lesson description | `"Understanding Newton's three fundamental laws"` |
| `order` | number | Display order within the chapter | `1` |
| `estimatedMinutes` | number | Estimated time to complete lesson (minutes) | `12` |
| `practiceMinutes` | number | Recommended practice time (minutes) | `60` |
| `difficulty` | string | Lesson difficulty level | `"beginner"`, `"intermediate"`, `"advanced"` |
| `prerequisites` | array | Array of prerequisite lesson IDs | `[]`, `["lesson_001"]` |
| `videos` | array | Array of video resource objects | See Video structure below |

## Video Structure

Videos represent multimedia learning resources associated with lessons.

```json
{
  "id": "string",
  "title": "string",
  "type": "string",
  "resourceUrl": "string",
  "thumbnailUrl": "string|null",
  "durationSeconds": "number",
  "category": "string"
}
```

### Video Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier for the video | `"video_001"` |
| `title` | string | Video title | `"Introduction to Newton's First Law"` |
| `type` | string | Video platform type | `"YOUTUBE"`, `"VIMEO"`, `"LOCAL"` |
| `resourceUrl` | string | Video resource URL or ID | `"0Qw4w9WgXcQ"`, `"https://example.com/video.mp4"` |
| `thumbnailUrl` | string\|null | Thumbnail image URL | `null`, `"https://img.youtube.com/vi/abc/thumbnail.jpg"` |
| `durationSeconds` | number | Video duration in seconds | `300` |
| `category` | string | Video category | `"LESSON"`, `"PRACTICE"`, `"REVIEW"` |

## Validation Rules

### ID Requirements
- All IDs must be unique within their scope (study plan, chapter, lesson, video)
- IDs should use lowercase letters, numbers, and underscores only
- Recommended format: `{type}_{sequential_number}` (e.g., `lesson_001`, `video_005`)

### Ordering
- Chapter `order` values must be unique within a study plan
- Lesson `order` values must be unique within a chapter
- Orders should start from 1 and be sequential

### Timestamps
- `createdAt` and `updatedAt` should be Unix timestamps in milliseconds
- For new study plans, both timestamps can be set to the current time
- `updatedAt` should be updated whenever the plan is modified

### Difficulty Levels
Valid difficulty values:
- `"beginner"`
- `"intermediate"`
- `"advanced"`

### Video Categories
Valid category values:
- `"LESSON"` - Main instructional content
- `"PRACTICE"` - Practice problems and exercises
- `"REVIEW"` - Summary and review content

### Video Types
Supported video types:
- `"YOUTUBE"` - YouTube video (resourceUrl should be video ID)
- `"VIMEO"` - Vimeo video
- `"LOCAL"` - Local file path or URL

## Example Usage

### Creating a New Study Plan

```json
{
  "id": "math_algebra_101",
  "name": "Algebra Fundamentals",
  "subjectName": "Mathematics",
  "description": "Basic algebra concepts and operations",
  "examBoardId": "IGCSE",
  "difficulty": "beginner",
  "version": 1,
  "isDeleted": false,
  "createdAt": 1731100000000,
  "updatedAt": 1731100000000,
  "createdBy": "teacher_john",
  "chapters": [
    {
      "id": "chapter_001",
      "name": "Linear Equations",
      "description": "Solving linear equations and inequalities",
      "order": 1,
      "lessons": [
        {
          "id": "lesson_001",
          "name": "Solving x + 3 = 7",
          "description": "Basic equation solving",
          "order": 1,
          "estimatedMinutes": 15,
          "practiceMinutes": 30,
          "difficulty": "beginner",
          "prerequisites": [],
          "videos": [
            {
              "id": "video_001",
              "title": "Introduction to Linear Equations",
              "type": "YOUTUBE",
              "resourceUrl": "dQw4w9WgXcQ",
              "thumbnailUrl": null,
              "durationSeconds": 450,
              "category": "LESSON"
            }
          ]
        }
      ]
    }
  ]
}
```

## Best Practices

1. **ID Generation**: Use consistent naming conventions for IDs across your study plans
2. **Ordering**: Ensure sequential ordering without gaps for better user experience
3. **Prerequisites**: Use lesson IDs from the same study plan for prerequisites
4. **Time Estimates**: Provide realistic time estimates based on content complexity
5. **Version Control**: Increment version number when making significant changes
6. **Timestamps**: Always update `updatedAt` when modifying existing plans

## Notes

- All string fields should be properly escaped JSON strings
- Empty arrays are valid for `prerequisites` and `videos`
- The `thumbnailUrl` can be `null` if no thumbnail is available
- Video durations should be calculated or estimated accurately for progress tracking
