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

  // Actualizar plato en el menú (Admin)
  updateFoodMenu: async (id, itemData) => {
    try {
      const response = await fetch(`${API_URL}/ID/${id}?sheet=Menu_Comida`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: itemData })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating food menu item:', error);
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

  // Actualizar producto en la tienda (Admin)
  updateShopInventory: async (id, itemData) => {
    try {
      const response = await fetch(`${API_URL}/ID/${id}?sheet=Inventario_Tienda`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: itemData })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating shop item:', error);
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
  },

  // ----- CLIENTES Y PUNTOS -----

  // Obtener puntos de un cliente por teléfono
  getClientePuntos: async (telefono) => {
    try {
      const telClean = telefono.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/search?Telefono=${telClean}&sheet=Clientes_Puntos`);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching client points:', error);
      return null;
    }
  },

  // Actualizar o crear registro de puntos del cliente
  updateOrCreateClientePuntos: async (telefono, nombre, puntosNuevos) => {
    try {
      const telClean = telefono.replace(/\D/g, '');
      console.log("Iniciando guardado de puntos para:", telClean);
      let nuevoTotal = parseInt(puntosNuevos);

      // GET: buscar si existe
      const responseGet = await fetch(`${API_URL}/search?Telefono=${telClean}&sheet=Clientes_Puntos`);
      console.log("Status de respuesta (GET search):", responseGet.status);
      if (!responseGet.ok) throw new Error('Error al buscar cliente en SheetDB');
      const data = await responseGet.json();
      
      if (data && data.length > 0) {
        // Si el cliente existe (hiciste el GET y devolvió un array con datos)
        const clienteActual = data[0];
        const puntosAnteriores = parseInt(clienteActual.Puntos_Acumulados, 10) || 0;
        const puntosNuevosInt = parseInt(puntosNuevos, 10) || 0;
        const totalActualizado = puntosAnteriores + puntosNuevosInt;
        
        nuevoTotal = totalActualizado;

        console.log(`Cliente encontrado. Puntos actuales: ${puntosAnteriores}. Sumando: ${puntosNuevosInt}. Total final: ${totalActualizado}`);

        // SINTAXIS CRÍTICA PARA SHEETDB PUT:
        // La URL debe ser: /ID_o_Columna/ValorBuscado?sheet=NombreHoja
        const putUrl = `${API_URL}/Telefono/${telClean}?sheet=Clientes_Puntos`;
        
        console.log("URL de actualización PUT:", putUrl);

        const responsePut = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { Puntos_Acumulados: totalActualizado } })
        });
        console.log("Status de respuesta (PUT):", responsePut.status);
        if (!responsePut.ok) throw new Error('Error al actualizar puntos');
      } else {
        // POST: si el cliente no existe
        const responsePost = await fetch(`${API_URL}?sheet=Clientes_Puntos`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { Telefono: telClean, Nombre_Cliente: nombre, Puntos_Acumulados: nuevoTotal } })
        });
        console.log("Status de respuesta (POST):", responsePost.status);
        if (!responsePost.ok) throw new Error('Error al crear cliente');
      }
      return nuevoTotal;
    } catch (error) {
      console.error('ERROR CRÍTICO EN SHEETDB:', error);
      throw error;
    }
  }
};
