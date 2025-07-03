'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// Custom hook for API calls with loading and error states
export function useAPI<T = any>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
}

// Specific hooks for different API endpoints
export function useChatHistory(limit?: number, offset?: number) {
  return useAPI(
    () => api.getChatHistory(limit, offset),
    [limit, offset],
    true
  );
}

export function useContextState() {
  return useAPI(
    () => api.getContextState(),
    [],
    true
  );
}

export function useFileList() {
  return useAPI(
    () => api.getFileList(),
    [],
    true
  );
}

export function useMemoryStatus() {
  return useAPI(
    () => api.getMemoryStatus(),
    [],
    true
  );
}

export function useChatStats() {
  return useAPI(
    () => api.getChatStats(),
    [],
    true
  );
}

// Hook for sending messages with optimistic updates
export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, files?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.sendMessage(message, files);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendMessage,
    loading,
    error,
  };
}

// Hook for file uploads with progress tracking
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const uploadFiles = useCallback(async (files: File[]) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate progress (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.uploadFiles(files);
      
      clearInterval(progressInterval);
      setProgress(100);
      setUploadedFiles(response.results || []);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after delay
    }
  }, []);

  return {
    uploadFiles,
    uploading,
    progress,
    error,
    uploadedFiles,
  };
}

// Hook for real-time context updates
export function useContextUpdates() {
  const [contextState, setContextState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshContext = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await api.getContextState();
      setContextState(state);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch context';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContext();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(refreshContext, 30000);
    
    return () => clearInterval(interval);
  }, [refreshContext]);

  return {
    contextState,
    loading,
    error,
    refreshContext,
  };
}

// Hook for memory search
export function useMemorySearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMemory = useCallback(async (
    query: string, 
    memoryType: string = 'all', 
    limit: number = 10
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.searchMemory(query, memoryType, limit);
      setResults(response.results || []);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchMemory,
    clearResults,
  };
}

// Hook for health monitoring
export function useHealthCheck() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      await api.healthCheck();
      setHealthy(true);
      setLastCheck(new Date());
    } catch (err) {
      setHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    healthy,
    lastCheck,
    checkHealth,
  };
}

// Hook for layer management
export function useLayerData(layerId: number) {
  const [layerData, setLayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLayerData = useCallback(async () => {
    if (layerId < 1 || layerId > 11) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getLayerData(layerId);
      setLayerData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch layer data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [layerId]);

  const updateLayer = useCallback(async (updates: any) => {
    try {
      setLoading(true);
      setError(null);
      await api.updateLayerConfig(layerId, updates);
      await fetchLayerData(); // Refresh data after update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update layer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [layerId, fetchLayerData]);

  useEffect(() => {
    fetchLayerData();
  }, [fetchLayerData]);

  return {
    layerData,
    loading,
    error,
    updateLayer,
    refetch: fetchLayerData,
  };
}

// Utility hook for debounced API calls
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}