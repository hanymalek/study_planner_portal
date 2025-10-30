import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for managing local edits of study plans (now using single storage with sync status)
export function useLocalEdits() {
  const [, setTrigger] = useState(0);
  
  // Force re-render when storage changes
  const forceUpdate = () => setTrigger(prev => prev + 1);
  
  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = () => forceUpdate();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get all plans from local storage
  const getAllPlans = (): any[] => {
    try {
      const item = window.localStorage.getItem('local_study_plans');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading plans from localStorage:', error);
      return [];
    }
  };

  // Save all plans to local storage
  const savePlans = (plans: any[]) => {
    try {
      window.localStorage.setItem('local_study_plans', JSON.stringify(plans));
      forceUpdate();
    } catch (error) {
      console.error('Error saving plans to localStorage:', error);
    }
  };

  // Get unsynced plans (new or modified)
  const getUnsyncedPlans = () => {
    const allPlans = getAllPlans();
    return allPlans.filter(plan => 
      plan._syncStatus === 'new' || plan._syncStatus === 'modified'
    );
  };

  // Add or update a plan (marks as new or modified)
  const addEdit = (id: string, data: any) => {
    const allPlans = getAllPlans();
    const index = allPlans.findIndex(p => p.id === id);
    
    const updatedPlan = {
      ...data,
      _syncStatus: data._syncStatus || (index >= 0 ? 'modified' : 'new')
    };
    
    if (index >= 0) {
      allPlans[index] = updatedPlan;
    } else {
      allPlans.push(updatedPlan);
    }
    
    savePlans(allPlans);
  };

  // Remove a plan from storage
  const removeEdit = (id: string) => {
    const allPlans = getAllPlans();
    const filtered = allPlans.filter(p => p.id !== id);
    savePlans(filtered);
  };

  // Clear unsynced edits (mark all as synced)
  const clearEdits = () => {
    const allPlans = getAllPlans();
    const clearedPlans = allPlans.map(plan => ({
      ...plan,
      _syncStatus: 'synced',
      _lastSyncedAt: Date.now()
    }));
    savePlans(clearedPlans);
  };

  // Get a specific plan
  const getEdit = (id: string) => {
    const allPlans = getAllPlans();
    return allPlans.find(p => p.id === id);
  };

  // Get all unsynced plans
  const getAllEdits = () => {
    return getUnsyncedPlans();
  };

  // Check if a plan has unsaved changes
  const hasEdit = (id: string) => {
    const plan = getEdit(id);
    return plan?._syncStatus === 'new' || plan?._syncStatus === 'modified';
  };

  const unsyncedPlans = getUnsyncedPlans();

  return {
    localEdits: unsyncedPlans.reduce((acc, plan) => ({ ...acc, [plan.id]: plan }), {}),
    hasUnsavedChanges: unsyncedPlans.length > 0,
    addEdit,
    removeEdit,
    clearEdits,
    getEdit,
    getAllEdits,
    hasEdit,
    editCount: unsyncedPlans.length
  };
}

