import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a specified delay in ms.
 * Useful for fast-updating user inputs (e.g., search fields) to prevent
 * excessive re-renders and redundant API calls.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

export default useDebounce;
