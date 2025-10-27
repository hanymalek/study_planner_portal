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

// Hook for managing local edits of study plans
export function useLocalEdits() {
  const [localEdits, setLocalEdits] = useLocalStorage<Record<string, any>>('study_plan_edits', {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(Object.keys(localEdits).length > 0);
  }, [localEdits]);

  const addEdit = (id: string, data: any) => {
    setLocalEdits(prev => ({
      ...prev,
      [id]: data
    }));
  };

  const removeEdit = (id: string) => {
    setLocalEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[id];
      return newEdits;
    });
  };

  const clearEdits = () => {
    setLocalEdits({});
  };

  const getEdit = (id: string) => {
    return localEdits[id];
  };

  const getAllEdits = () => {
    return Object.values(localEdits);
  };

  const hasEdit = (id: string) => {
    return id in localEdits;
  };

  return {
    localEdits,
    hasUnsavedChanges,
    addEdit,
    removeEdit,
    clearEdits,
    getEdit,
    getAllEdits,
    hasEdit,
    editCount: Object.keys(localEdits).length
  };
}

