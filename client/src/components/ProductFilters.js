import React from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Typography,
  Paper,
  Grid,
  Button
} from '@mui/material';
import { Search, FilterList, Straighten } from '@mui/icons-material';

const ProductFilters = ({ 
  searchTerm, 
  onSearchChange, 
  category, 
  onCategoryChange, 
  sortBy, 
  onSortChange,
  brands,
  selectedBrand,
  onBrandChange,
  availableSizes,
  selectedSizes,
  onSizesChange 
}) => {
  const categories = [
    { value: 'all', label: 'Toutes catégories', emoji: '👟' },
    { value: 'men', label: 'Homme', emoji: '👨' },
    { value: 'women', label: 'Femme', emoji: '👩' },
    { value: 'kids', label: 'Enfant', emoji: '🧒' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom A-Z' },
    { value: 'name-desc', label: 'Nom Z-A' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Nouveautés' }
  ];

  return (
    <Paper 
      component="section"
      elevation={0}
      role="search"
      aria-label="Filtres de recherche des produits"
      sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterList sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Filtrer les produits
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Recherche */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Recherche"
            placeholder="Rechercher des sneakers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'grey.500' }} />
            }}
            inputProps={{
              'aria-label': 'Rechercher des sneakers par nom ou marque'
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        </Grid>

        {/* Catégorie */}
        <Grid item xs={12} sm={6} md={2.25}>
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              label="Catégorie"
              sx={{ borderRadius: '12px' }}
              inputProps={{
                'aria-label': 'Filtrer par catégorie de sneakers'
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Marque */}
        <Grid item xs={12} sm={6} md={2.25}>
          <FormControl fullWidth>
            <InputLabel>Marque</InputLabel>
            <Select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              label="Marque"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="all">Toutes les marques</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Tri */}
        <Grid item xs={12} sm={6} md={2.25}>
          <FormControl fullWidth>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              label="Trier par"
              sx={{ borderRadius: '12px' }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Pointures */}
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Straighten sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Filtrer par pointure
              </Typography>
              {selectedSizes && selectedSizes.length > 0 && (
                <Chip
                  label={`${selectedSizes.length} sélectionnée${selectedSizes.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    backgroundColor: 'primary.light',
                    color: 'primary.dark',
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
            
            {availableSizes && availableSizes.length > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap',
                maxHeight: '120px',
                overflowY: 'auto',
                p: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: '12px',
                backgroundColor: 'grey.50'
              }}>
                {availableSizes.map((sizeData) => {
                  const isSelected = selectedSizes?.includes(sizeData.key);
                  
                  // Couleurs par type de pointure
                  const getTypeColor = (sizeType) => {
                    switch (sizeType) {
                      case 'EU': return { bg: '#3498db', hover: '#2980b9' }; // Bleu
                      case 'US': return { bg: '#e74c3c', hover: '#c0392b' }; // Rouge
                      case 'UK': return { bg: '#27ae60', hover: '#1e8449' }; // Vert
                      default: return { bg: '#f39c12', hover: '#e67e22' }; // Orange par défaut
                    }
                  };
                  
                  const typeColors = getTypeColor(sizeData.sizeType);
                  
                  return (
                    <Chip
                      key={sizeData.key}
                      label={sizeData.display}
                      clickable
                      onClick={() => {
                        const currentSizes = selectedSizes || [];
                        if (isSelected) {
                          // Retirer la pointure
                          onSizesChange(currentSizes.filter(s => s !== sizeData.key));
                        } else {
                          // Ajouter la pointure
                          onSizesChange([...currentSizes, sizeData.key]);
                        }
                      }}
                      sx={{
                        minWidth: '60px',
                        height: '36px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? typeColors.bg : 'white',
                        color: isSelected ? 'white' : 'text.primary',
                        border: '1px solid',
                        borderColor: isSelected ? typeColors.bg : 'grey.300',
                        '&:hover': {
                          backgroundColor: isSelected ? typeColors.hover : typeColors.bg,
                          color: 'white',
                          borderColor: isSelected ? typeColors.hover : typeColors.bg,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 8px ${typeColors.bg}40`
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ 
                p: 2, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: '12px',
                backgroundColor: 'grey.50'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune pointure disponible
                </Typography>
              </Box>
            )}
            
            {selectedSizes && selectedSizes.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => onSizesChange([])}
                  sx={{ 
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  Effacer toutes les pointures
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Chips actifs */}
      {(category !== 'all' || selectedBrand !== 'all' || searchTerm || (selectedSizes && selectedSizes.length > 0)) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {category !== 'all' && (
            <Chip
              label={`Catégorie: ${categories.find(c => c.value === category)?.label}`}
              onDelete={() => onCategoryChange('all')}
              color="primary"
              variant="outlined"
            />
          )}
          {selectedBrand !== 'all' && (
            <Chip
              label={`Marque: ${selectedBrand}`}
              onDelete={() => onBrandChange('all')}
              color="primary"
              variant="outlined"
            />
          )}
          {selectedSizes && selectedSizes.length > 0 && (
            <Chip
              label={`Pointures: ${selectedSizes.map(sizeKey => {
                const [size, sizeType] = sizeKey.split('-');
                return `${size} ${sizeType}`;
              }).join(', ')}`}
              onDelete={() => onSizesChange([])}
              color="primary"
              variant="outlined"
              icon={<Straighten />}
            />
          )}
          {searchTerm && (
            <Chip
              label={`Recherche: "${searchTerm}"`}
              onDelete={() => onSearchChange('')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProductFilters;