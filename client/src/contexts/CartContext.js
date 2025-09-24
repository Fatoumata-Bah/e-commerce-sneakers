import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getLocalCart = () => {
    const localCart = localStorage.getItem('anonymousCart');
    return localCart ? JSON.parse(localCart) : { items: [], total: 0, count: 0 };
  };

  const saveLocalCart = (cartData) => {
    localStorage.setItem('anonymousCart', JSON.stringify(cartData));
  };

  const migrateAnonymousCart = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.items.length === 0) return;

    try {
      for (const item of localCart.items) {
        await cartService.add(item.productVariantId, item.quantity);
      }
      localStorage.removeItem('anonymousCart');
    } catch (error) {
      console.error('Erreur lors de la migration du panier:', error);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(getLocalCart());
      return;
    }
    try {
      setLoading(true);
      
             await migrateAnonymousCart();
      
      const response = await cartService.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart(getLocalCart());
    } finally {
      setLoading(false);
    }
  }, [user, migrateAnonymousCart]);

  const addToCart = async (productVariantId, quantity = 1, productInfo = null) => {
    if (user) {
      try {
        await cartService.add(productVariantId, quantity);
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Failed to add to cart' };
      }
           } else {
             const currentCart = getLocalCart();
      const existingItemIndex = currentCart.items.findIndex(
        item => item.productVariantId === productVariantId
      );

      if (existingItemIndex >= 0) {
        currentCart.items[existingItemIndex].quantity += quantity;
      } else {
        currentCart.items.push({
          id: Date.now().toString(),
          productVariantId,
          quantity,
          productInfo
             });
           }

           currentCart.count = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
      currentCart.total = currentCart.items.reduce((sum, item) => {
        const price = item.productInfo?.basePrice || 0;
        return sum + (item.quantity * price);
      }, 0);

      saveLocalCart(currentCart);
      setCart(currentCart);
      return { success: true };
    }
  };

  const updateCart = async (id, quantity) => {
    if (user) {
      try {
        await cartService.update(id, quantity);
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Failed to update cart' };
      }
    } else {
      // Gestion du panier local pour utilisateurs non connectés
      if (quantity < 1) {
        return { success: false, error: 'Quantité invalide' };
      }
      
      const currentCart = getLocalCart();
      const itemIndex = currentCart.items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Article non trouvé' };
      }
      
      // Vérifier le stock disponible si l'information est disponible
      const item = currentCart.items[itemIndex];
      const availableStock = item.productInfo?.variant?.stock;
      if (availableStock !== undefined && quantity > availableStock) {
        return { success: false, error: `Stock insuffisant. Stock disponible: ${availableStock}` };
      }
      
      // Mettre à jour la quantité
      currentCart.items[itemIndex].quantity = quantity;
      
      // Recalculer les totaux
      currentCart.count = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
      currentCart.total = currentCart.items.reduce((sum, item) => {
        const price = item.productInfo?.basePrice || 0;
        return sum + (item.quantity * price);
      }, 0);
      
      saveLocalCart(currentCart);
      setCart(currentCart);
      return { success: true };
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await cartService.remove(id);
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Failed to remove from cart' };
      }
    } else {
      // Gestion du panier local pour utilisateurs non connectés
      const currentCart = getLocalCart();
      const itemIndex = currentCart.items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Article non trouvé' };
      }
      
      // Supprimer l'article
      currentCart.items.splice(itemIndex, 1);
      
      // Recalculer les totaux
      currentCart.count = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
      currentCart.total = currentCart.items.reduce((sum, item) => {
        const price = item.productInfo?.basePrice || 0;
        return sum + (item.quantity * price);
      }, 0);
      
      saveLocalCart(currentCart);
      setCart(currentCart);
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await cartService.clear();
        await fetchCart();
        return { success: true };
      } catch (error) {
        console.error('Erreur lors du vidage du panier:', error);
        return { success: false, error: error.response?.data?.error || 'Failed to clear cart' };
      }
    } else {
      const emptyCart = { items: [], total: 0, count: 0 };
      saveLocalCart(emptyCart);
      setCart(emptyCart);
      return { success: true };
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateCart,
      removeFromCart,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
