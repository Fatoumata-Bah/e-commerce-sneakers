import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FiltersContext';

const AuthFiltersSync = ({ children }) => {
  const { user } = useAuth();
  const { resetFilters } = useFilters();

  useEffect(() => {
    // Réinitialiser les filtres lors du changement d'utilisateur
    // (connexion, déconnexion, ou changement d'utilisateur)
    resetFilters();
  }, [user?.id, resetFilters]); // Se déclenche quand l'ID de l'utilisateur change

  return children;
};

export default AuthFiltersSync;
