import { useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCartTimer } from '../contexts/CartTimerContext';

/**
 * Hook personnalisé qui combine les fonctionnalités du panier avec le timer
 * Prolonge automatiquement le timer lors d'ajout d'articles
 */
export const useCartWithTimer = () => {
  const cart = useCart();
  const { extendOnAddItem } = useCartTimer();

  // Wrapper pour addToCart qui prolonge automatiquement le timer
  const addToCartWithTimer = useCallback(async (...args) => {
    try {
      // Ajouter l'article au panier
      const result = await cart.addToCart(...args);
      
      if (result.success) {
        // Toujours utiliser extendOnAddItem - il gère déjà la logique d'expiration
        setTimeout(() => {
          extendOnAddItem();
        }, 100);
      } else {
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier avec timer:', error);
      return { success: false, error: error.message };
    }
  }, [cart, extendOnAddItem]);

  return {
    ...cart,
    addToCart: addToCartWithTimer
  };
};

export default useCartWithTimer;
