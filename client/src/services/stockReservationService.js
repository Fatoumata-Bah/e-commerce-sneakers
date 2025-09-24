const API_BASE_URL = 'http://localhost:4000/api';

class StockReservationService {
  
  // Obtenir l'ID de session pour les utilisateurs anonymes
  static getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Headers communs avec session ID
  static getHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      headers['x-session-id'] = this.getSessionId();
    }
    
    return headers;
  }

  /**
   * Réserver du stock
   */
  static async reserveStock(productVariantId, quantity, durationMinutes = 2) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/reserve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          productVariantId,
          quantity,
          durationMinutes
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation');
      }

      return data;
    } catch (error) {
      console.error('Erreur réservation stock:', error);
      throw error;
    }
  }

  /**
   * Prolonger une réservation
   */
  static async extendReservation(productVariantId, additionalMinutes = 2) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/extend`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          productVariantId,
          additionalMinutes
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la prolongation');
      }

      return data;
    } catch (error) {
      console.error('Erreur prolongation réservation:', error);
      throw error;
    }
  }

  /**
   * Libérer une réservation
   */
  static async releaseReservation(productVariantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/release`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          productVariantId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la libération');
      }

      return data;
    } catch (error) {
      console.error('Erreur libération réservation:', error);
      throw error;
    }
  }

  /**
   * Libérer toutes les réservations
   */
  static async releaseAllReservations() {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/release-all`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la libération');
      }

      return data;
    } catch (error) {
      console.error('Erreur libération toutes réservations:', error);
      throw error;
    }
  }

  /**
   * Obtenir les réservations de l'utilisateur
   */
  static async getMyReservations() {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/my-reservations`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération');
      }

      return data;
    } catch (error) {
      console.error('Erreur récupération réservations:', error);
      throw error;
    }
  }

  /**
   * Obtenir le stock disponible
   */
  static async getAvailableStock(productVariantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-reservations/available-stock/${productVariantId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification du stock');
      }

      return data;
    } catch (error) {
      console.error('Erreur vérification stock:', error);
      throw error;
    }
  }
}

export default StockReservationService;
