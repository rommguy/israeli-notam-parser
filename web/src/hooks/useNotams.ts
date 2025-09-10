import { useState, useEffect, useMemo, useCallback } from 'react';
import type { NOTAM, ParsedNotamData } from '../types';
import { loadNotamData, filterNotamsByIcao, filterNotamsByReadStatus, getNotamStats } from '../services/notamService';
import { useNotamReadState } from './useLocalStorage';

interface UseNotamsResult {
  // Data
  notams: NOTAM[];
  rawData: ParsedNotamData | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Filtering
  filteredNotams: NOTAM[];
  selectedIcaoCodes: string[];
  showOnlyUnread: boolean;
  
  // Statistics
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byIcao: Record<string, number>;
  };
  
  // Actions
  setSelectedIcaoCodes: (codes: string[]) => void;
  setShowOnlyUnread: (showOnlyUnread: boolean) => void;
  markAsRead: (notamId: string) => void;
  markAsUnread: (notamId: string) => void;
  toggleReadStatus: (notamId: string) => void;
  isRead: (notamId: string) => boolean;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing NOTAM data, filtering, and read state
 */
export function useNotams(dateSelection: 'today' | 'tomorrow'): UseNotamsResult {
  // State for data loading
  const [rawData, setRawData] = useState<ParsedNotamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering
  const [selectedIcaoCodes, setSelectedIcaoCodes] = useState<string[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  
  // Read state management
  const [readState, setNotamReadStatus, toggleNotamReadStatus] = useNotamReadState();

  // Load data function
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await loadNotamData(dateSelection);
      setRawData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NOTAM data');
      setRawData(null);
    } finally {
      setIsLoading(false);
    }
  }, [dateSelection]);

  // Load data on mount and when date selection changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get base NOTAMs array
  const notams = useMemo(() => {
    return rawData?.notams || [];
  }, [rawData]);

  // Apply filters to get filtered NOTAMs
  const filteredNotams = useMemo(() => {
    let filtered = notams;
    
    // Filter by ICAO codes
    filtered = filterNotamsByIcao(filtered, selectedIcaoCodes);
    
    // Filter by read status
    filtered = filterNotamsByReadStatus(filtered, readState, showOnlyUnread);
    
    return filtered;
  }, [notams, selectedIcaoCodes, readState, showOnlyUnread]);

  // Calculate statistics
  const stats = useMemo(() => {
    return getNotamStats(notams, readState);
  }, [notams, readState]);

  // Read state helper functions
  const markAsRead = useCallback((notamId: string) => {
    setNotamReadStatus(notamId, true);
  }, [setNotamReadStatus]);

  const markAsUnread = useCallback((notamId: string) => {
    setNotamReadStatus(notamId, false);
  }, [setNotamReadStatus]);

  const toggleReadStatus = useCallback((notamId: string) => {
    toggleNotamReadStatus(notamId);
  }, [toggleNotamReadStatus]);

  const isRead = useCallback((notamId: string) => {
    return Boolean(readState[notamId]);
  }, [readState]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Data
    notams,
    rawData,
    
    // Loading states
    isLoading,
    error,
    
    // Filtering
    filteredNotams,
    selectedIcaoCodes,
    showOnlyUnread,
    
    // Statistics
    stats,
    
    // Actions
    setSelectedIcaoCodes,
    setShowOnlyUnread,
    markAsRead,
    markAsUnread,
    toggleReadStatus,
    isRead,
    refreshData,
  };
}

/**
 * Hook for managing data from both today and tomorrow
 */
export function useAllNotams(): {
  today: UseNotamsResult;
  tomorrow: UseNotamsResult;
  hasErrors: boolean;
  isAnyLoading: boolean;
} {
  const today = useNotams('today');
  const tomorrow = useNotams('tomorrow');

  const hasErrors = Boolean(today.error || tomorrow.error);
  const isAnyLoading = today.isLoading || tomorrow.isLoading;

  return {
    today,
    tomorrow,
    hasErrors,
    isAnyLoading,
  };
}
