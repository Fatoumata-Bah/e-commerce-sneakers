import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes
 * @returns {any} - La valeur debouncée
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Créer un timer qui mettra à jour la valeur debouncée après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;