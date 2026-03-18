import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions<T> {
  fetchFn: () => Promise<T>;
  timeout?: number;
  dependencies?: unknown[];
  enabled?: boolean;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const DEFAULT_TIMEOUT = 15000; // 15 seconds

export function useDataFetch<T>({
  fetchFn,
  timeout = DEFAULT_TIMEOUT,
  dependencies = [],
  enabled = true,
}: UseDataFetchOptions<T>): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout. Please check your connection and try again.'));
        }, timeout);
      });

      // Race between fetch and timeout
      const result = await Promise.race([fetchFn(), timeoutPromise]);

      if (mountedRef.current) {
        setData(result);
      }

      // Clear timeout on success
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [fetchFn, timeout, enabled]);

  const retry = useCallback(() => {
    setError(null);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData, ...dependencies]);

  return { data, loading, error, retry };
}
