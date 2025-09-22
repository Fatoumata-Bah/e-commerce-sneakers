/**
 * UTILITAIRES DE FORMATAGE
 * =========================
 * 
 * Fonctions utilitaires pour formater les données d'affichage
 */

/**
 * Formate un montant en euros avec 2 décimales
 * @param {number|string} amount - Le montant à formater
 * @returns {string} - Le montant formaté (ex: "123.45€")
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '0.00€';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '0.00€';
  
  return `${numericAmount.toFixed(2)}€`;
};

/**
 * Formate un montant en euros sans le symbole €
 * @param {number|string} amount - Le montant à formater
 * @returns {string} - Le montant formaté (ex: "123.45")
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '0.00';
  
  return numericAmount.toFixed(2);
};

/**
 * Formate une date en français
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée (ex: "22/09/2025")
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('fr-FR');
};

/**
 * Formate une date et heure en français
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date et heure formatées (ex: "22/09/2025 à 14:30")
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('fr-FR') + ' à ' + dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number|string} number - Le nombre à formater
 * @returns {string} - Le nombre formaté (ex: "1 234")
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numericValue)) return '0';
  
  return numericValue.toLocaleString('fr-FR');
};

/**
 * Formate un pourcentage
 * @param {number|string} value - La valeur à formater (0.15 pour 15%)
 * @param {number} decimals - Nombre de décimales (défaut: 1)
 * @returns {string} - Le pourcentage formaté (ex: "15.0%")
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0.0%';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '0.0%';
  
  return `${(numericValue * 100).toFixed(decimals)}%`;
};

/**
 * Formate le statut d'une commande en français
 * @param {string} status - Le statut en anglais
 * @returns {string} - Le statut en français
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'processing': 'En cours',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  };
  
  return statusMap[status] || status;
};

/**
 * Formate le statut de paiement en français
 * @param {string} status - Le statut de paiement en anglais
 * @returns {string} - Le statut en français
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': 'En attente',
    'paid': 'Payé',
    'failed': 'Échoué',
    'refunded': 'Remboursé'
  };
  
  return statusMap[status] || status;
};

/**
 * Formate la méthode de paiement en français
 * @param {string} method - La méthode de paiement en anglais
 * @returns {string} - La méthode en français
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'card': 'Carte bancaire',
    'paypal': 'PayPal',
    'transfer': 'Virement',
    'cash': 'Espèces'
  };
  
  return methodMap[method] || method;
};
