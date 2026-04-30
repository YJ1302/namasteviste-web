const API_URL = 'https://script.google.com/macros/s/AKfycbwdXAwKepmKMq1pWbujzfvrbQSy6vZROC-J_r-HKT8dOFawcX2c3xcTVF7idLImpTdZ5A/exec';

const cleanAndDeduplicate = (data) => {
  if (!Array.isArray(data)) return [];
  const unique = [];
  const seenNames = new Set();
  
  for (const item of data) {
    const nameStr = item.Nombre || item.Imagen_URL; 
    if (!nameStr || String(nameStr).trim() === '') continue; 
    
    if (!seenNames.has(nameStr)) {
      seenNames.add(nameStr);
      unique.push(item);
    }
  }
  return unique;
};

// Función auxiliar para centralizar las peticiones POST (Apps Script)
const postData = async (action, payload = {}, id = null) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8' // Obligatorio para evitar CORS en Apps Script
    },
    body: JSON.stringify({ action, payload, id })
  });
  if (!response.ok) throw new Error('Error de red al conectar con Google Apps Script');
  return await response.json();
};

export const sheetsService = {
  // ----- MENU DE COMIDA -----

  getAllFoodMenu: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getMenu`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      return cleanAndDeduplicate(data);
    } catch (error) {
      console.error('Error fetching all food menu:', error);
      return [];
    }
  },

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

  addFoodMenu: async (itemData) => {
    try {
      return await postData('addMenu', itemData);
    } catch (error) {
      console.error('Error adding food menu item:', error);
      throw error;
    }
  },

  updateFoodMenu: async (id, itemData) => {
    try {
      return await postData('updateMenu', itemData, id);
    } catch (error) {
      console.error('Error updating food menu item:', error);
      throw error;
    }
  },

  // ----- INVENTARIO TIENDA -----

  getAllShopInventory: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getShop`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      return cleanAndDeduplicate(data);
    } catch (error) {
      console.error('Error fetching all shop inventory:', error);
      return [];
    }
  },

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

  addShopInventory: async (itemData) => {
    try {
      return await postData('addShop', itemData);
    } catch (error) {
      console.error('Error adding shop item:', error);
      throw error;
    }
  },

  updateShopInventory: async (id, itemData) => {
    try {
      return await postData('updateShop', itemData, id);
    } catch (error) {
      console.error('Error updating shop item:', error);
      throw error;
    }
  },

  // ----- PEDIDOS -----

  createOrder: async (orderData) => {
    try {
      return await postData('addOrder', orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // ----- CLIENTES Y PUNTOS -----

  getClientePuntos: async (telefono) => {
    try {
      const telClean = telefono.replace(/\D/g, '');
      const response = await fetch(`${API_URL}?action=getClientePuntos&telefono=${telClean}`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching client points:', error);
      return null;
    }
  },

  updateOrCreateClientePuntos: async (telefono, nombre, puntosNuevos) => {
    try {
      const telClean = telefono.replace(/\D/g, '');
      console.log("Iniciando guardado de puntos para:", telClean);
      let nuevoTotal = parseInt(puntosNuevos, 10) || 0;

      // GET: buscar si existe
      const responseGet = await fetch(`${API_URL}?action=getClientePuntos&telefono=${telClean}`);
      if (!responseGet.ok) throw new Error('Error al buscar cliente');
      const data = await responseGet.json();
      
      if (data && data.length > 0) {
        // Update
        const clienteActual = data[0];
        const puntosAnteriores = parseInt(clienteActual.Puntos_Acumulados, 10) || 0;
        const totalActualizado = puntosAnteriores + nuevoTotal;
        nuevoTotal = totalActualizado;
        
        await postData('updateOrCreateClientePuntos', { Telefono: telClean, Puntos_Acumulados: totalActualizado });
      } else {
        // Create
        await postData('updateOrCreateClientePuntos', { Telefono: telClean, Nombre_Cliente: nombre, Puntos_Acumulados: nuevoTotal });
      }
      return nuevoTotal;
    } catch (error) {
      console.error('ERROR CRÍTICO EN APPS SCRIPT:', error);
      throw error;
    }
  },

  // ----- BACKGROUNDS -----

  getAllBackgrounds: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getBackgrounds`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      return cleanAndDeduplicate(data);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      return [];
    }
  },

  addBackground: async (itemData) => {
    try {
      return await postData('addBackground', itemData);
    } catch (error) {
      console.error('Error adding background:', error);
      throw error;
    }
  },

  updateBackground: async (id, itemData) => {
    try {
      return await postData('updateBackground', itemData, id);
    } catch (error) {
      console.error('Error updating background:', error);
      throw error;
    }
  },

  deleteBackground: async (id) => {
    try {
      return await postData('deleteBackground', {}, id);
    } catch (error) {
      console.error('Error deleting background:', error);
      throw error;
    }
  }
};
