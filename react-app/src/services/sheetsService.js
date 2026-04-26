/**
 * Servicio para conectarse a Google Sheets utilizando SheetDB.
 * SheetDB proporciona una API REST fácil de usar que lee y escribe
 * directamente en nuestra hoja de Google Sheets.
 * 
 * Requisito: Crear una cuenta en sheetdb.io y conectar tu URL de la hoja de cálculo.
 */

// Reemplaza esto con tu URL de API de SheetDB (ejemplo: https://sheetdb.io/api/v1/tu-id-api)
const API_URL = 'https://sheetdb.io/api/v1/bqa32l4pgnxwl';

export const sheetsService = {
  // ----- MENU DE COMIDA -----

  // Obtener todo el menú (Para Admin)
  getAllFoodMenu: async () => {
    try {
      const response = await fetch(`${API_URL}?sheet=Menu_Comida`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all food menu:', error);
      return [];
    }
  },

  // Obtener menú público (solo Activos)
  getPublicFoodMenu: async () => {
    try {
      const data = await sheetsService.getAllFoodMenu();
      return data.filter(item => {
        const activo = String(item.Activo).trim().toUpperCase();
        return activo === 'VERDADERO' || activo === 'TRUE' || activo === '1';
      });
    } catch (error) {
      console.error('Error fetching public food menu:', error);
      return [];
    }
  },

  // Añadir plato al menú (Admin)
  addFoodMenu: async (itemData) => {
    try {
      const response = await fetch(`${API_URL}?sheet=Menu_Comida`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [itemData] }) // Formato requerido por SheetDB
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding food menu item:', error);
      throw error;
    }
  },

  // ----- INVENTARIO TIENDA -----

  // Obtener todo el inventario (Para Admin)
  getAllShopInventory: async () => {
    try {
      const response = await fetch(`${API_URL}?sheet=Inventario_Tienda`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all shop inventory:', error);
      return [];
    }
  },

  // Obtener inventario público (solo con Stock > 0)
  getPublicShopInventory: async () => {
    try {
      const data = await sheetsService.getAllShopInventory();
      return data.filter(item => {
        const stock = parseInt(item.Stock, 10);
        return !isNaN(stock) && stock > 0;
      });
    } catch (error) {
      console.error('Error fetching public shop inventory:', error);
      return [];
    }
  },

  // Añadir producto a la tienda (Admin)
  addShopInventory: async (itemData) => {
    try {
      const response = await fetch(`${API_URL}?sheet=Inventario_Tienda`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [itemData] })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding shop item:', error);
      throw error;
    }
  },

  // ----- PEDIDOS -----

  // Crear un nuevo pedido (Checkout)
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}?sheet=Pedidos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [orderData] })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
};
