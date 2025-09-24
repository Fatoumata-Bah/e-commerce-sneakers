import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { expiredCartService } from '../services/api';

const CartTimerContext = createContext();

export const useCartTimer = () => {
  const context = useContext(CartTimerContext);
  if (!context) {
    throw new Error('useCartTimer must be used within a CartTimerProvider');
  }
  return context;
};

export const CartTimerProvider = ({ children }) => {
  // Timer de production (15 minutes)
  const CART_DURATION = 15 * 60; // 15 minutes
  const WARNING_THRESHOLD = 5 * 60; // Avertissement à 5 minutes
  
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState(null);
  const [isSavingExpired, setIsSavingExpired] = useState(false);
  
  // Ref pour éviter les appels multiples de saveExpiredItems
  const savingInProgressRef = useRef(false);
  
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // Sécuriser l'accès aux items du panier avec useMemo
  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);

  // Fonction pour démarrer le timer
  const startTimer = useCallback(() => {
    const startTime = Date.now();
    setTimeRemaining(CART_DURATION);
    setIsActive(true);
    setIsExpired(false);
    setShowWarning(false);
    setLastActivity(startTime);
    
    // Réinitialiser le verrou de sauvegarde
    savingInProgressRef.current = false;
    
    // Stocker dans localStorage pour persistance
    localStorage.setItem('cartTimerStart', startTime.toString());
    localStorage.setItem('cartTimerDuration', CART_DURATION.toString());
  }, [CART_DURATION]);

  // Fonction pour prolonger le timer
  const extendTimer = useCallback(() => {
    console.log('⏰ extendTimer appelé - Prolongation de', CART_DURATION, 'secondes');
    const now = Date.now();
    setTimeRemaining(CART_DURATION);
    setShowWarning(false);
    setIsExpired(false);
    setLastActivity(now);
    
    // Mettre à jour localStorage
    localStorage.setItem('cartTimerStart', now.toString());
    localStorage.setItem('cartTimerDuration', CART_DURATION.toString());
    
    console.log('✅ Timer prolongé avec succès');
    
    showNotification('⏰ Panier prolongé de 15 minutes !', 'success');
  }, [CART_DURATION, showNotification]);

  // Fonction pour arrêter le timer
  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(null);
    setShowWarning(false);
    setIsExpired(false);
    setIsPaused(false);
    setPausedTimeRemaining(null);
    
    // Nettoyer localStorage
    localStorage.removeItem('cartTimerStart');
    localStorage.removeItem('cartTimerDuration');
    localStorage.removeItem('cartTimerPaused');
    localStorage.removeItem('cartTimerPausedTime');
  }, []);

  // Fonction pour mettre en pause le timer
  const pauseTimer = useCallback(() => {
    if (isActive && !isPaused && timeRemaining !== null) {
      console.log('⏸️ Mise en pause du timer avec', timeRemaining, 'secondes restantes');
      setIsPaused(true);
      setPausedTimeRemaining(timeRemaining);
      
      // Sauvegarder l'état de pause
      localStorage.setItem('cartTimerPaused', 'true');
      localStorage.setItem('cartTimerPausedTime', timeRemaining.toString());
      
      showNotification('⏸️ Timer mis en pause pendant votre commande', 'info');
      return true;
    }
    return false;
  }, [isActive, isPaused, timeRemaining, showNotification]);

  // Fonction pour reprendre le timer
  const resumeTimer = useCallback(() => {
    if (isPaused && pausedTimeRemaining !== null) {
      console.log('▶️ Reprise du timer avec', pausedTimeRemaining, 'secondes restantes');
      
      const now = Date.now();
      setTimeRemaining(pausedTimeRemaining);
      setIsPaused(false);
      setPausedTimeRemaining(null);
      setLastActivity(now);
      
      // Mettre à jour localStorage avec le nouveau départ
      localStorage.setItem('cartTimerStart', now.toString());
      localStorage.setItem('cartTimerDuration', pausedTimeRemaining.toString());
      localStorage.removeItem('cartTimerPaused');
      localStorage.removeItem('cartTimerPausedTime');
      
      showNotification('▶️ Timer repris', 'info');
      return true;
    }
    return false;
  }, [isPaused, pausedTimeRemaining, showNotification]);

  // Fonction pour formater le temps restant
  const formatTime = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Fonction pour sauvegarder les articles avant expiration
  const saveExpiredItems = useCallback(async () => {
    // Protection contre les appels multiples
    if (savingInProgressRef.current) {
      return Promise.resolve();
    }

    if (!cartItems.length || !user) {
      return Promise.resolve();
    }

    try {
      // Marquer comme en cours
      savingInProgressRef.current = true;
      
      // Préparer les données des articles pour la sauvegarde
      const itemsToSave = cartItems.map(item => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      }));

      // Appeler le service pour sauvegarder
      const response = await expiredCartService.saveExpiredItems(itemsToSave);
      
      showNotification('📦 Vos articles ont été sauvegardés dans votre historique', 'info');
      
      return Promise.resolve(response);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des articles expirés:', error);
      
      // Afficher une notification d'erreur à l'utilisateur
      showNotification('❌ Erreur lors de la sauvegarde de vos articles', 'error');
      
      // Re-throw l'erreur pour que la chaîne de promesses puisse la gérer
      throw error;
    } finally {
      // Libérer le verrou après un délai pour éviter les appels immédiats
      setTimeout(() => {
        savingInProgressRef.current = false;
      }, 2000); // 2 secondes de protection
    }
  }, [user, cartItems, showNotification]);

  // Restaurer le timer depuis localStorage au chargement
  useEffect(() => {
    if (!cart) {
      console.log('🔄 Restauration timer: cart pas encore chargé');
      return; // Attendre que le cart soit chargé
    }

    console.log('🔄 Tentative de restauration du timer...');
    const savedStart = localStorage.getItem('cartTimerStart');
    const savedDuration = localStorage.getItem('cartTimerDuration');
    console.log('   - savedStart:', savedStart);
    console.log('   - savedDuration:', savedDuration);
    console.log('   - cartItems.length:', cartItems.length);
    console.log('   - isActive actuel:', isActive);
    
    // Si le timer est déjà actif, ne pas le redémarrer
    if (isActive) {
      console.log('⚠️ Timer déjà actif, pas de restauration');
      return;
    }
    
    // Vérifier d'abord s'il y a un timer en pause
    const isPausedSaved = localStorage.getItem('cartTimerPaused') === 'true';
    const pausedTime = localStorage.getItem('cartTimerPausedTime');
    
    if (isPausedSaved && pausedTime && cartItems.length > 0) {
      console.log('✅ Restauration du timer EN PAUSE avec', pausedTime, 'secondes');
      setTimeRemaining(parseInt(pausedTime));
      setIsActive(true);
      setIsPaused(true);
      setPausedTimeRemaining(parseInt(pausedTime));
      setLastActivity(Date.now());
    } else if (savedStart && savedDuration && cartItems.length > 0) {
      const startTime = parseInt(savedStart);
      const duration = parseInt(savedDuration);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = duration - elapsed;
      
      console.log('   - remaining:', remaining);
      
      if (remaining > 0) {
        console.log('✅ Restauration du timer avec', remaining, 'secondes restantes');
        setTimeRemaining(remaining);
        setIsActive(true);
        setLastActivity(startTime);
        
        // Vérifier si on doit afficher le warning
        if (remaining <= WARNING_THRESHOLD) {
          setShowWarning(true);
        }
      } else {
        // Timer expiré - vider le panier
        console.log('💀 Timer expiré lors de la restauration - Vidage du panier');
        setIsExpired(true);
        setIsActive(false);
        if (clearCart) {
          clearCart();
        }
        localStorage.removeItem('cartTimerStart');
        localStorage.removeItem('cartTimerDuration');
      }
    } else if (cartItems.length > 0 && !savedStart) {
      console.log('❌ Panier avec articles mais pas de timer sauvegardé - Possible perte de timer');
      // Ne pas démarrer automatiquement ici, laisser extendOnAddItem le faire
    } else {
      console.log('❌ Pas de timer à restaurer ou panier vide');
    }
  }, [cart, cartItems.length, isActive, WARNING_THRESHOLD, clearCart]);

  // Arrêter le timer automatiquement quand le panier est vide
  useEffect(() => {
    if (!cart) return; // Attendre que le cart soit chargé

    // Arrêter le timer seulement si le panier est vide ET que le timer est actif
    if (cartItems.length === 0 && isActive) {
      console.log('🛑 Arrêt du timer (panier vide)');
      stopTimer();
    }
    
    // Note: Le démarrage du timer est maintenant géré uniquement par extendOnAddItem
  }, [cart, cartItems.length, isActive, stopTimer]);

  // Empêcher le redémarrage automatique après expiration
  useEffect(() => {
    if (isExpired && cartItems.length === 0) {
      console.log('⚠️ Timer expiré avec panier vide - Nettoyage complet');
      // S'assurer que le timer reste arrêté ET nettoyer localStorage
      if (isActive) {
        console.log('🛑 Arrêt forcé du timer après expiration');
        stopTimer();
      }
      
      // IMPORTANT: Nettoyer localStorage pour empêcher la restauration
      console.log('🧹 Nettoyage complet du localStorage après expiration');
      localStorage.removeItem('cartTimerStart');
      localStorage.removeItem('cartTimerDuration');
      localStorage.removeItem('cartTimerPaused');
      localStorage.removeItem('cartTimerPausedTime');
    }
  }, [isExpired, cartItems.length, isActive, stopTimer]);

  // Gestion du décompte (seulement si pas en pause)
  useEffect(() => {
    if (!isActive || timeRemaining === null || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer expiré - sauvegarder puis supprimer les articles du panier
          console.log('⏰ TIMER EXPIRÉ - Sauvegarde et vidage du panier');
          setIsActive(false);
          setIsExpired(true);
          setShowWarning(false);
          
          // Éviter les appels multiples
          if (!isSavingExpired) {
            setIsSavingExpired(true);
            
            // FORCER l'arrêt complet du timer et nettoyage localStorage
            console.log('🛑 ARRÊT FORCÉ ET NETTOYAGE COMPLET IMMÉDIAT');
            localStorage.removeItem('cartTimerStart');
            localStorage.removeItem('cartTimerDuration');
            localStorage.removeItem('cartTimerPaused');
            localStorage.removeItem('cartTimerPausedTime');
            
            // Sauvegarder les articles avant de vider le panier
            console.log('🔄 Début de la séquence: Sauvegarde -> Vidage du panier');
            saveExpiredItems()
              .then(() => {
                console.log('✅ Sauvegarde terminée, maintenant vidage du panier...');
                // Vider le panier SEULEMENT après la sauvegarde réussie
                if (clearCart) {
                  console.log('Appel de clearCart()');
                  return clearCart();
                } else {
                  console.error('❌ clearCart non disponible');
                  return Promise.resolve({ success: false, error: 'clearCart not available' });
                }
              })
              .then((result) => {
                console.log('Résultat clearCart:', result);
                if (result.success) {
                  console.log('✅ Panier vidé avec succès');
                } else {
                  console.error('❌ Échec du vidage du panier:', result.error);
                }
              })
              .catch((error) => {
                console.error('❌ Erreur lors de la séquence sauvegarde/vidage:', error);
                // Même en cas d'erreur de sauvegarde, vider le panier pour éviter les blocages
                if (clearCart) {
                  console.log('🔄 Vidage du panier malgré l\'erreur de sauvegarde...');
                  clearCart().catch(console.error);
                }
              })
              .finally(() => {
                setIsSavingExpired(false);
                console.log('🔄 Séquence sauvegarde/vidage terminée');
              });
            
            showNotification('⏰ Articles sauvegardés dans votre historique', 'info');
          }
          
          return 0;
        }
        
        // Afficher l'avertissement à 5 minutes
        if (prev <= WARNING_THRESHOLD && !showWarning) {
          setShowWarning(true);
          showNotification('⚠️ Attention ! Votre panier expire dans 5 minutes', 'warning');
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, isPaused, showWarning, isSavingExpired, WARNING_THRESHOLD, showNotification, clearCart, saveExpiredItems]);

  // Mettre à jour l'activité utilisateur
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Écouter les événements d'activité utilisateur
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Fonction pour prolonger automatiquement le timer lors d'ajout d'article
  const extendOnAddItem = useCallback(() => {
    console.log('🔔 extendOnAddItem appelé');
    console.log('   - isActive:', isActive);
    console.log('   - isExpired:', isExpired);
    console.log('   - timeRemaining:', timeRemaining);
    console.log('   - cartItems:', cartItems.length);
    
    // Ne rien faire si le panier est vide (sécurité)
    if (cartItems.length === 0) {
      console.log('❌ Panier vide -> Pas d\'action sur le timer');
      return;
    }

    // Ne JAMAIS redémarrer si on vient d'expirer (sauf si c'est un vrai nouvel ajout)
    if (isExpired) {
      console.log('⚠️ Timer récemment expiré - Vérification si c\'est un vrai nouvel ajout');
      // Pour l'instant, ne pas redémarrer automatiquement après expiration
      // Cela nécessiterait une logique plus complexe pour détecter les vrais nouveaux ajouts
      console.log('❌ Pas de redémarrage automatique après expiration');
      return;
    }
    
    if (isActive && !isExpired && timeRemaining !== null) {
      // Si le timer est actif, le prolonger
      console.log('⏰ Timer actif -> Prolongation automatique');
      extendTimer();
      showNotification('⏰ Timer prolongé automatiquement (+2 min)', 'success');
    } else if (!isActive && timeRemaining === null) {
      // Si pas de timer actif et pas récemment expiré, démarrer un nouveau timer
      console.log('🚀 Pas de timer actif -> Démarrage du timer (utilisateur connecté ou anonyme)');
      startTimer();
    } else {
      console.log('❌ Conditions non remplies pour démarrer/prolonger le timer');
      console.log('   - isActive:', isActive);
      console.log('   - isExpired:', isExpired);
      console.log('   - timeRemaining:', timeRemaining);
      console.log('   - État actuel non géré');
    }
  }, [isActive, isExpired, timeRemaining, cartItems.length, extendTimer, startTimer, showNotification]);

  // Fonction pour récupérer un timer perdu (par exemple après connexion)
  const recoverLostTimer = useCallback(() => {
    console.log('🔄 Tentative de récupération du timer perdu...');
    
    if (cartItems.length > 0 && !isActive) {
      const savedStart = localStorage.getItem('cartTimerStart');
      const savedDuration = localStorage.getItem('cartTimerDuration');
      
      if (savedStart && savedDuration) {
        const startTime = parseInt(savedStart);
        const duration = parseInt(savedDuration);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;
        
        if (remaining > 0) {
          console.log('✅ Timer récupéré avec', remaining, 'secondes restantes');
          setTimeRemaining(remaining);
          setIsActive(true);
          setLastActivity(startTime);
          
          if (remaining <= WARNING_THRESHOLD) {
            setShowWarning(true);
          }
          
          showNotification('⏰ Timer récupéré après connexion', 'info');
          return true;
        }
      }
      
      // Si pas de timer sauvegardé mais panier non vide, démarrer un nouveau timer
      console.log('🚀 Pas de timer sauvegardé mais panier non vide -> Démarrage nouveau timer');
      startTimer();
      showNotification('⏰ Timer démarré après connexion', 'info');
      return true;
    }
    
    console.log('❌ Impossible de récupérer le timer');
    return false;
  }, [cartItems.length, isActive, WARNING_THRESHOLD, startTimer, showNotification]);

  // Fonction pour forcer le redémarrage du timer (après expiration et nouvel ajout)
  const forceRestartTimer = useCallback(() => {
    console.log('🔄 Redémarrage forcé du timer après expiration');
    setIsExpired(false);
    setIsActive(false);
    setTimeRemaining(null);
    
    // Nettoyer localStorage
    localStorage.removeItem('cartTimerStart');
    localStorage.removeItem('cartTimerDuration');
    
    // Démarrer un nouveau timer
    setTimeout(() => {
      startTimer();
    }, 100);
  }, [startTimer]);

  const value = {
    timeRemaining,
    isActive,
    isExpired,
    isPaused,
    showWarning,
    lastActivity,
    startTimer,
    extendTimer,
    extendOnAddItem,
    recoverLostTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    forceRestartTimer,
    formatTime,
    updateActivity,
    CART_DURATION,
    WARNING_THRESHOLD
  };

  return (
    <CartTimerContext.Provider value={value}>
      {children}
    </CartTimerContext.Provider>
  );
};

export default CartTimerContext;
