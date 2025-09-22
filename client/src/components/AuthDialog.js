import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AuthDialog = ({ open, onClose, message }) => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const { login, register } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
           if (tab === 0) {
             result = await login({
               email: formData.email,
               password: formData.password
             });
           } else {
             result = await register(formData);
           }

      if (result.success) {
        onClose();
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
        
        if (result.hasAnonymousCart) {
          showNotification('Vos articles ont été ajoutés à votre panier !', 'success');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Connexion" />
          <Tab label="Inscription" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {tab === 1 && (
            <>
              <TextField
                name="firstName"
                label="Prénom"
                fullWidth
                margin="normal"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                name="lastName"
                label="Nom"
                fullWidth
                margin="normal"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="password"
            label="Mot de passe"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              fullWidth
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (tab === 0 ? 'Se connecter' : 'S\'inscrire')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
