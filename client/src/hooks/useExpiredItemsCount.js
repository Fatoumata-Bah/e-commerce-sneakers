import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expiredCartService } from '../services/api';

/**
 * Hook pour obtenir le nombre d'articles expirés non réordonnés
 * @returns {number} - Le nombre d'articles expirés
 */
const useExpiredItemsCount = () => {
  const { user } = useAuth();
  const [expiredItemsCount, setExpiredItemsCount] = useState(0);

  useEffect(() => {
    const fetchExpiredItemsCount = async () => {
      if (!user) {
        setExpiredItemsCount(0);
        return;
      }

      try {
        const response = await expiredCartService.getExpiredItems({ 
          limit: 1000, // Obtenir tous les éléments pour compter
          showOnlyNotReordered: true // Seulement les articles non réordonnés
        });
        
        if (response.data && response.data.items) {
          setExpiredItemsCount(response.data.items.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du compteur d\'articles expirés:', error);
        setExpiredItemsCount(0);
      }
    };

    fetchExpiredItemsCount();

    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(fetchExpiredItemsCount, 30000);

    // Écouter les événements de mise à jour des articles expirés
    const handleExpiredItemsUpdate = () => {
      fetchExpiredItemsCount();
    };
    
    window.addEventListener('expiredItemsUpdated', handleExpiredItemsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('expiredItemsUpdated', handleExpiredItemsUpdate);
    };
  }, [user]);

  return expiredItemsCount;
};

export default useExpiredItemsCount;
