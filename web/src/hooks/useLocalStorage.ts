import { useState, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook specifically for managing NOTAM read state
 */
export function useNotamReadState(): [
  Record<string, boolean>,
  (notamId: string, isRead: boolean) => void,
  (notamId: string) => void,
  () => void
] {
  const [readState, setReadState, clearReadState] = useLocalStorage<Record<string, boolean>>(
    'notam-read-state',
    {}
  );

  // Mark a NOTAM as read or unread
  const setNotamReadStatus = useCallback(
    (notamId: string, isRead: boolean) => {
      setReadState(prev => ({
        ...prev,
        [notamId]: isRead
      }));
    },
    [setReadState]
  );

  // Toggle read status of a NOTAM
  const toggleNotamReadStatus = useCallback(
    (notamId: string) => {
      setReadState(prev => ({
        ...prev,
        [notamId]: !prev[notamId]
      }));
    },
    [setReadState]
  );

  return [readState, setNotamReadStatus, toggleNotamReadStatus, clearReadState];
}

/**
 * Hook for managing filter preferences
 */
export function useFilterPreferences(): [
  {
    selectedIcaoCodes: string[];
    showOnlyUnread: boolean;
  },
  (icaoCodes: string[]) => void,
  (showOnlyUnread: boolean) => void,
  () => void
] {
  const [filterPrefs, setFilterPrefs, clearFilterPrefs] = useLocalStorage(
    'notam-filter-preferences',
    {
      selectedIcaoCodes: [] as string[],
      showOnlyUnread: false
    }
  );

  const setSelectedIcaoCodes = useCallback(
    (icaoCodes: string[]) => {
      setFilterPrefs(prev => ({
        ...prev,
        selectedIcaoCodes: icaoCodes
      }));
    },
    [setFilterPrefs]
  );

  const setShowOnlyUnread = useCallback(
    (showOnlyUnread: boolean) => {
      setFilterPrefs(prev => ({
        ...prev,
        showOnlyUnread
      }));
    },
    [setFilterPrefs]
  );

  return [filterPrefs, setSelectedIcaoCodes, setShowOnlyUnread, clearFilterPrefs];
}
