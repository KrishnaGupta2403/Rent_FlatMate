'use client';
import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFunction, initialParams = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFunction(params);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialParams]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute, setData };
};

export default useFetch;
