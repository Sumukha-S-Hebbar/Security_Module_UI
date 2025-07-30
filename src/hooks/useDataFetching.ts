
'use client';

import { useState, useEffect } from 'react';

export function useDataFetching<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
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
    }

    // Only fetch if dependencies are met (e.g., org is loaded)
    const canFetch = deps.every(dep => dep !== null && dep !== undefined);
    if (canFetch) {
        fetchData();
    }
  }, deps);

  return { data, isLoading, error };
}
