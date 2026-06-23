import { useEffect, useState } from 'react';
import { getJson } from '../services/api';

export function useApiData(path, errorMessage) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const result = await getJson(path);
        if (!isCancelled) {
          setData(result);
        }
      } catch {
        if (!isCancelled) {
          setError(errorMessage ?? `Could not load data from ${path}.`);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [path, errorMessage]);

  return { data, isLoading, error };
}
