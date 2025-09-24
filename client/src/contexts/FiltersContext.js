import React, { createContext, useContext, useState, useCallback } from 'react';
import useDebounce from '../hooks/useDebounce';

const FiltersContext = createContext();

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};

export const FiltersProvider = ({ children }) => {
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Debouncer le terme de recherche avec un délai de 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setBrandFilter('all');
    setSizeFilter([]);
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  // Fonction pour réinitialiser seulement la pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const value = {
    // États
    searchTerm,
    debouncedSearchTerm, // Exposer la version debouncée
    categoryFilter,
    brandFilter,
    sizeFilter,
    sortBy,
    currentPage,
    
    // Setters
    setSearchTerm,
    setCategoryFilter,
    setBrandFilter,
    setSizeFilter,
    setSortBy,
    setCurrentPage,
    
    // Actions
    resetFilters,
    resetPagination
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};

export default FiltersContext;
