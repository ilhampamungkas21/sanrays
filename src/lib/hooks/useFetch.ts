"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions<T> {
  data?: T;
  error?: string;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  initialData?: T
): UseFetchOptions<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}
