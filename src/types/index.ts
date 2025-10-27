// Type definitions for Study Planner Portal

export enum VideoType {
  YOUTUBE = 'YOUTUBE',
  LOCAL = 'LOCAL',
  URL = 'URL'
}

export enum VideoCategory {
  LESSON = 'LESSON',
  PRACTICE = 'PRACTICE',
  QUIZ = 'QUIZ',
  REVIEW = 'REVIEW'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface VideoResource {
  id: string;
  title: string;
  type: VideoType;
  resourceUrl: string; // YouTube ID, file path, or direct URL
  thumbnailUrl?: string;
  durationSeconds: number;
  category: VideoCategory;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  videos: VideoResource[];
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface StudyPlan {
  id: string;
  name: string;
  subjectName: string;
  description: string;
  examBoardId: string;
  difficulty: Difficulty;
  version: number;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  chapters: Chapter[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  activeScheduleId?: string;
  createdAt: number;
}

export interface UserProgress {
  userId: string;
  scheduleId: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: number;
  videoProgress: Record<string, VideoProgress>;
  lessonCompletions: Record<string, LessonCompletion>;
  dailyStats: Record<string, DailyStats>;
  badges: Badge[];
}

export interface VideoProgress {
  videoId: string;
  lessonId: string;
  watchedSeconds: number;
  totalSeconds: number;
  isCompleted: boolean;
  lastWatchedAt: number;
}

export interface LessonCompletion {
  lessonId: string;
  isCompleted: boolean;
  completedAt: number | null;
  completedVideoIds: string[];
}

export interface DailyStats {
  date: string;
  videosCompleted: number;
  minutesStudied: number;
  lessonsCompleted: number;
}

export interface Badge {
  type: string;
  title: string;
  description: string;
  earnedAt: number;
}

// For JSON import
export interface StudyPlanImport {
  name: string;
  subjectName: string;
  description: string;
  examBoardId: string;
  difficulty: Difficulty;
  chapters: ChapterImport[];
}

export interface ChapterImport {
  name: string;
  description: string;
  lessons: LessonImport[];
}

export interface LessonImport {
  name: string;
  description: string;
  estimatedMinutes: number;
  videos: VideoResourceImport[];
}

export interface VideoResourceImport {
  title: string;
  type: VideoType;
  resourceUrl: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  category?: VideoCategory;
}

