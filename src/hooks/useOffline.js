/**
 * FatToFit useOffline Hook
 * Custom hook for offline state management
 */

import { useState, useEffect, useCallback } from 'react';
import offlineService from '../services/offlineService';

const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize offline service
    offlineService.initialize().then(({ isOnline: online }) => {
      setIsOnline(online);
      setPendingActions(offlineService.getPendingActions());
    });

    // Subscribe to network changes
    const unsubscribe = offlineService.addNetworkListener((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const queueAction = useCallback(async (action) => {
    const queued = await offlineService.queueAction(action);
    setPendingActions(offlineService.getPendingActions());
    return queued;
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return { success: false };
    }

    setIsSyncing(true);
    const result = await offlineService.syncOfflineQueue();
    setPendingActions(offlineService.getPendingActions());
    setIsSyncing(false);

    return result;
  }, [isOnline, isSyncing]);

  const cacheData = useCallback(async (key, data, ttl) => {
    return offlineService.cacheData(key, data, ttl);
  }, []);

  const getCachedData = useCallback(async (key) => {
    return offlineService.getCachedData(key);
  }, []);

  const fetchWithCache = useCallback(async (key, fetchFn, options) => {
    return offlineService.fetchWithCache(key, fetchFn, options);
  }, []);

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    queueAction,
    syncNow,
    cacheData,
    getCachedData,
    fetchWithCache,
  };
};

export default useOffline;


