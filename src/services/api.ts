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

// Study Plans
export const getAllStudyPlans = async (): Promise<StudyPlan[]> => {
  const plansRef = collection(db, 'study_plans');
  const q = query(plansRef, where('isDeleted', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudyPlan));
};

export const getStudyPlan = async (id: string): Promise<StudyPlan | null> => {
  const docRef = doc(db, 'study_plans', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as StudyPlan;
  }
  return null;
};

export const saveStudyPlan = async (plan: StudyPlan): Promise<void> => {
  const docRef = doc(db, 'study_plans', plan.id);
  await setDoc(docRef, {
    ...plan,
    updatedAt: Date.now()
  });
};

export const deleteStudyPlan = async (id: string): Promise<void> => {
  const docRef = doc(db, 'study_plans', id);
  await updateDoc(docRef, {
    isDeleted: true,
    updatedAt: Date.now()
  });
};

export const batchSaveStudyPlans = async (plans: StudyPlan[]): Promise<void> => {
  const batch = writeBatch(db);
  plans.forEach(plan => {
    const docRef = doc(db, 'study_plans', plan.id);
    batch.set(docRef, {
      ...plan,
      updatedAt: Date.now()
    });
  });
  await batch.commit();
};

// Users
export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
};

export const getUser = async (id: string): Promise<User | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as User;
  }
  return null;
};

export const saveUser = async (user: User): Promise<void> => {
  const docRef = doc(db, 'users', user.id);
  await setDoc(docRef, user);
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { role });
};

// User Progress (for analytics)
export const getUserProgress = async (userId: string, scheduleId: string): Promise<UserProgress | null> => {
  const progressId = `${userId}__${scheduleId}`;
  const docRef = doc(db, 'user_progress', progressId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  }
  return null;
};

export const getAllUserProgress = async (): Promise<UserProgress[]> => {
  const progressRef = collection(db, 'user_progress');
  const snapshot = await getDocs(progressRef);
  return snapshot.docs.map(doc => doc.data() as UserProgress);
};

