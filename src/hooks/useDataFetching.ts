
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDataFetching<T>(
  fetcher: () => Promise<T>,
  deps: any[],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDataCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, deps);


  useEffect(() => {
    // Only fetch if dependencies are met (e.g., org is loaded) and the hook is enabled
    const canFetch = deps.every(dep => dep !== null && dep !== undefined);
    if (canFetch && enabled) {
        fetchDataCallback();
    } else if (!enabled) {
        setIsLoading(false);
    }
  }, [...deps, enabled]);

  return { data, isLoading, error, refetch: fetchDataCallback };
}
