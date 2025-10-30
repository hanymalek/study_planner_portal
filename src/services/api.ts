import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { StudyPlan, User, UserProgress } from '../types';

// ===========================
// LOCAL STORAGE MANAGEMENT
// ===========================

const STORAGE_VERSION = 1;
const KEYS = {
  STUDY_PLANS: 'local_study_plans',
  USERS: 'local_users',
  STORAGE_VERSION: 'storage_version',
};

// Migrate from old dual-storage to new single-storage system
const migrateFromDualStorage = () => {
  try {
    const oldEdits = getFromLocalStorage<Record<string, any>>('study_plan_edits');
    if (oldEdits && Object.keys(oldEdits).length > 0) {
      console.log('Migrating from old dual-storage system...');
      
      const mainPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
      const planMap = new Map<string, StudyPlan>();
      
      // Add all main plans
      mainPlans.forEach(plan => planMap.set(plan.id, {
        ...plan,
        _syncStatus: 'synced' as const,
        _lastSyncedAt: plan.updatedAt || Date.now()
      }));
      
      // Add/override with edited plans (mark as modified or new)
      Object.values(oldEdits).forEach((editedPlan: any) => {
        const existsInMain = planMap.has(editedPlan.id);
        planMap.set(editedPlan.id, {
          ...editedPlan,
          _syncStatus: existsInMain ? 'modified' as const : 'new' as const
        });
      });
      
      // Save migrated plans
      const migratedPlans = Array.from(planMap.values());
      saveToLocalStorage(KEYS.STUDY_PLANS, migratedPlans);
      
      // Remove old edits storage
      localStorage.removeItem('study_plan_edits');
      
      console.log(`Migration complete: ${migratedPlans.length} plans migrated`);
    }
  } catch (error) {
    console.error('Error during storage migration:', error);
  }
};

// Initialize or migrate storage version
const initializeStorage = () => {
  const currentVersion = localStorage.getItem(KEYS.STORAGE_VERSION);
  if (!currentVersion) {
    localStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION.toString());
  }
  
  // Migrate from old system if needed
  migrateFromDualStorage();
};

initializeStorage();

// Generic local storage helpers
const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// ===========================
// STUDY PLANS - SINGLE STORAGE WITH SYNC STATUS
// ===========================

// Helper to strip sync metadata before sending to Firebase
const stripSyncMetadata = (plan: StudyPlan): any => {
  const { _syncStatus, _lastSyncedAt, ...planWithoutMeta } = plan;
  return planWithoutMeta;
};

export const getAllStudyPlans = async (syncWithFirebase = false): Promise<StudyPlan[]> => {
  if (syncWithFirebase) {
    // Fetch from Firebase
    const plansRef = collection(db, 'study_plans');
    const q = query(plansRef, where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    const firebasePlans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudyPlan));
    
    // Get current local plans
    const localPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
    
    // Merge: Firebase plans take priority, but keep local-only plans
    const planMap = new Map<string, StudyPlan>();
    
    // Add all local plans first
    localPlans.forEach(plan => planMap.set(plan.id, plan));
    
    // Override with Firebase plans and mark as synced
    const now = Date.now();
    firebasePlans.forEach(fbPlan => {
      planMap.set(fbPlan.id, {
        ...fbPlan,
        _syncStatus: 'synced',
        _lastSyncedAt: now
      });
    });
    
    const mergedPlans = Array.from(planMap.values());
    saveToLocalStorage(KEYS.STUDY_PLANS, mergedPlans);
    return mergedPlans;
  }

  // Return from local storage
  const localPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS);
  return localPlans || [];
};

export const getStudyPlan = (id: string): StudyPlan | null => {
  const allPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
  return allPlans.find(p => p.id === id) || null;
};

export const saveStudyPlan = async (plan: StudyPlan, markAsModified = true): Promise<void> => {
  const allPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
  const index = allPlans.findIndex(p => p.id === plan.id);
  
  const now = Date.now();
  const updatedPlan: StudyPlan = {
    ...plan,
    updatedAt: now,
    _syncStatus: markAsModified ? (plan._syncStatus === 'new' ? 'new' : 'modified') : plan._syncStatus,
  };
  
  if (index >= 0) {
    allPlans[index] = updatedPlan;
  } else {
    updatedPlan.createdAt = now;
    updatedPlan._syncStatus = 'new';
    allPlans.push(updatedPlan);
  }
  
  saveToLocalStorage(KEYS.STUDY_PLANS, allPlans);
};

export const deleteStudyPlan = async (id: string): Promise<void> => {
  const allPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
  const filtered = allPlans.filter(p => p.id !== id);
  saveToLocalStorage(KEYS.STUDY_PLANS, filtered);
};

export const batchSaveStudyPlans = async (plans: StudyPlan[]): Promise<void> => {
  // Upload to Firebase
  const batch = writeBatch(db);
  const now = Date.now();
  
  plans.forEach(plan => {
    const docRef = doc(db, 'study_plans', plan.id);
    const planData = stripSyncMetadata(plan);
    batch.set(docRef, {
      ...planData,
      updatedAt: now
    });
  });
  
  await batch.commit();
  
  // Mark all uploaded plans as synced in local storage
  const allPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
  const uploadedIds = new Set(plans.map(p => p.id));
  
  const updatedPlans = allPlans.map(plan => {
    if (uploadedIds.has(plan.id)) {
      return {
        ...plan,
        _syncStatus: 'synced' as const,
        _lastSyncedAt: now
      };
    }
    return plan;
  });
  
  saveToLocalStorage(KEYS.STUDY_PLANS, updatedPlans);
};

// Get all plans that need syncing (new or modified)
export const getUnsyncedPlans = (): StudyPlan[] => {
  const allPlans = getFromLocalStorage<StudyPlan[]>(KEYS.STUDY_PLANS) || [];
  return allPlans.filter(plan => plan._syncStatus === 'new' || plan._syncStatus === 'modified');
};

// Check if a specific plan has unsaved changes
export const hasUnsavedChanges = (planId: string): boolean => {
  const plan = getStudyPlan(planId);
  return plan?._syncStatus === 'new' || plan?._syncStatus === 'modified';
};

// ===========================
// USERS - LOCAL FIRST
// ===========================

export const getAllUsers = async (syncWithFirebase = false): Promise<User[]> => {
  if (syncWithFirebase) {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
    saveToLocalStorage(KEYS.USERS, users);
    return users;
  }

  const localUsers = getFromLocalStorage<User[]>(KEYS.USERS);
  return localUsers || [];
};

export const getUser = async (id: string, syncWithFirebase = false): Promise<User | null> => {
  if (syncWithFirebase) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const user = { ...docSnap.data(), id: docSnap.id } as User;
      // Update in local storage
      const allUsers = getFromLocalStorage<User[]>(KEYS.USERS) || [];
      const index = allUsers.findIndex(u => u.id === id);
      if (index >= 0) {
        allUsers[index] = user;
      } else {
        allUsers.push(user);
      }
      saveToLocalStorage(KEYS.USERS, allUsers);
      return user;
    }
    return null;
  }

  const allUsers = getFromLocalStorage<User[]>(KEYS.USERS) || [];
  return allUsers.find(u => u.id === id) || null;
};

export const saveUser = async (user: User): Promise<void> => {
  const docRef = doc(db, 'users', user.id);
  await setDoc(docRef, user);
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { role });
};

// ===========================
// USER PROGRESS - LOCAL FIRST
// ===========================

const getProgressKey = (userId: string, scheduleId: string) => 
  `user_progress_${userId}__${scheduleId}`;

export const getUserProgress = (userId: string, scheduleId: string): UserProgress | null => {
  const key = getProgressKey(userId, scheduleId);
  return getFromLocalStorage<UserProgress>(key);
};

export const saveUserProgress = (userId: string, scheduleId: string, progress: UserProgress): void => {
  const key = getProgressKey(userId, scheduleId);
  saveToLocalStorage(key, progress);
};

export const getAllUserProgressForUser = (userId: string): UserProgress[] => {
  const allProgress: UserProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`user_progress_${userId}__`)) {
        const progress = getFromLocalStorage<UserProgress>(key);
        if (progress) {
          allProgress.push(progress);
        }
      }
    }
  } catch (error) {
    console.error('Error reading all user progress:', error);
  }
  return allProgress;
};

export const getAllUserProgress = async (): Promise<UserProgress[]> => {
  const progressRef = collection(db, 'user_progress');
  const snapshot = await getDocs(progressRef);
  return snapshot.docs.map(doc => doc.data() as UserProgress);
};

export const syncProgressToFirebase = async (userId: string, scheduleId: string): Promise<void> => {
  const progress = getUserProgress(userId, scheduleId);
  if (!progress) return;

  const progressId = `${userId}__${scheduleId}`;
  const docRef = doc(db, 'user_progress', progressId);
  await setDoc(docRef, progress);
};

export const syncProgressFromFirebase = async (userId: string, scheduleId: string): Promise<UserProgress | null> => {
  const progressId = `${userId}__${scheduleId}`;
  const docRef = doc(db, 'user_progress', progressId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const progress = docSnap.data() as UserProgress;
    saveUserProgress(userId, scheduleId, progress);
    return progress;
  }
  return null;
};

// ===========================
// STUDY SCHEDULES - LOCAL FIRST
// ===========================

export interface StudySchedule {
  id: string;
  userId: string;
  studyPlanId: string;
  studyPlanVersion: number;
  name: string;
  finalExamDate?: number | null;
  studyDays: string[];
  hoursPerDay: number;
  createdAt: number;
  updatedAt: number;
}

const SCHEDULES_KEY = 'local_schedules';

export const getAllSchedules = (): StudySchedule[] => {
  return getFromLocalStorage<StudySchedule[]>(SCHEDULES_KEY) || [];
};

export const getSchedulesByStudyPlanId = (studyPlanId: string, userId?: string): StudySchedule[] => {
  const allSchedules = getAllSchedules();
  let filtered = allSchedules.filter(s => s.studyPlanId === studyPlanId);
  
  if (userId) {
    filtered = filtered.filter(s => s.userId === userId);
  }
  
  return filtered;
};

export const saveSchedule = (schedule: StudySchedule): void => {
  const allSchedules = getAllSchedules();
  const index = allSchedules.findIndex(s => s.id === schedule.id);
  
  if (index >= 0) {
    allSchedules[index] = { ...schedule, updatedAt: Date.now() };
  } else {
    allSchedules.push({ ...schedule, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  saveToLocalStorage(SCHEDULES_KEY, allSchedules);
};

export const syncSchedulesFromFirebase = async (userId?: string): Promise<StudySchedule[]> => {
  const schedulesRef = collection(db, 'study_schedules');
  let q = query(schedulesRef);
  
  if (userId) {
    q = query(schedulesRef, where('userId', '==', userId));
  }
  
  const snapshot = await getDocs(q);
  const schedules = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudySchedule));
  
  // Merge with local schedules
  const allSchedules = getAllSchedules();
  const merged = [...allSchedules];
  
  schedules.forEach(fbSchedule => {
    const index = merged.findIndex(s => s.id === fbSchedule.id);
    if (index >= 0) {
      merged[index] = fbSchedule;
    } else {
      merged.push(fbSchedule);
    }
  });
  
  saveToLocalStorage(SCHEDULES_KEY, merged);
  return schedules;
};

// ===========================
// HELPER FUNCTIONS
// ===========================

export const getUserProgressForPlan = (userId: string, studyPlanId: string): UserProgress | null => {
  // Get all schedules for this plan and user
  const schedules = getSchedulesByStudyPlanId(studyPlanId, userId);
  
  if (schedules.length === 0) {
    // Try to find progress by matching lesson IDs
    const plan = getStudyPlan(studyPlanId);
    if (!plan) return null;
    
    const allLessonIds = new Set(
      plan.chapters.flatMap(ch => ch.lessons.map(lesson => lesson.id))
    );
    
    // Check all progress for this user
    const allProgress = getAllUserProgressForUser(userId);
    for (const progress of allProgress) {
      if (progress.lessonCompletions) {
        const hasMatchingLessons = Object.keys(progress.lessonCompletions).some(
          lessonId => allLessonIds.has(lessonId)
        );
        if (hasMatchingLessons) {
          return progress;
        }
      }
    }
    
    return null;
  }
  
  // Check progress for each schedule
  for (const schedule of schedules) {
    const progress = getUserProgress(userId, schedule.id);
    if (progress) {
      return progress;
    }
  }
  
  return null;
};

// Clear all local data (useful for testing or reset)
export const clearAllLocalData = (): void => {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Also clear progress and schedules
  localStorage.removeItem(SCHEDULES_KEY);
  
  // Clear all progress entries
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_progress_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  initializeStorage();
};
