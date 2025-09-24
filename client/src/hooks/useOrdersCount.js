import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';

/**
 * Hook pour obtenir le nombre de commandes en attente
 * @returns {number} - Le nombre de commandes en attente
 */
const useOrdersCount = () => {
  const { user } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      if (!user) {
        setPendingOrdersCount(0);
        return;
      }

      try {
        const response = await orderService.getAll();
        if (response.data && response.data.orders) {
          // Compter les commandes en attente (pending, processing)
          const pendingOrders = response.data.orders.filter(order => 
            order.status === 'pending' || order.status === 'processing'
          );
          setPendingOrdersCount(pendingOrders.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du compteur de commandes:', error);
        setPendingOrdersCount(0);
      }
    };

    fetchPendingOrdersCount();

    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(fetchPendingOrdersCount, 30000);

    // Écouter les événements de mise à jour des commandes
    const handleOrdersUpdate = () => {
      fetchPendingOrdersCount();
    };
    
    window.addEventListener('ordersUpdated', handleOrdersUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, [user]);

  return pendingOrdersCount;
};

export default useOrdersCount;
