import { useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour la mise à jour automatique
 * @param {Function} refreshFunction - Fonction à appeler pour la mise à jour
 * @param {number} interval - Intervalle en millisecondes (défaut: 30 secondes)
 * @param {boolean} enabled - Activer/désactiver la mise à jour automatique
 */
const useAutoRefresh = (refreshFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);
  const refreshFunctionRef = useRef(refreshFunction);

  // Mettre à jour la référence de la fonction
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Démarrer l'intervalle
    intervalRef.current = setInterval(() => {
      if (refreshFunctionRef.current) {
        refreshFunctionRef.current();
      }
    }, interval);

    // Nettoyer l'intervalle au démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled]);

  // Fonction pour forcer une mise à jour immédiate
  const forceRefresh = () => {
    if (refreshFunctionRef.current) {
      refreshFunctionRef.current();
    }
  };

  return { forceRefresh };
};

export default useAutoRefresh;
