import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AIChatbot from './components/AIChatbot';
import { sheetsService } from './services/sheetsService';

import Home from './pages/Home';
import FoodMenu from './pages/FoodMenu';
import Shop from './pages/Shop';
import Admin from './pages/Admin';

import './index.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [todosLosProductos, setTodosLosProductos] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [foodData, storeData] = await Promise.all([
          sheetsService.getPublicFoodMenu(),
          sheetsService.getPublicShopInventory()
        ]);
        
        const formatData = (data, type) => data.map(item => ({
          id: item.ID,
          name: item.Nombre,
          desc: item.Descripcion,
          price: parseFloat(item.Precio) || 0,
          img: item.Imagen_URL || '/images/default_food.png',
          category: (item.Categoria || '').toLowerCase(),
          type: type,
          rating: 4.8,
          Puntos_Otorgados: parseInt(item.Puntos_Otorgados, 10) || 0
        }));

        setTodosLosProductos([...formatData(foodData, 'food'), ...formatData(storeData, 'shop')]);
      } catch (err) {
        console.error("Error loading products for upsell:", err);
      }
    };
    loadProducts();
  }, []);

  return (
    <CartProvider>
      <div className="app-container">
        <AnnouncementBar />
        <Header onOpenCart={() => setIsCartOpen(true)} />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comida" element={<FoodMenu />} />
            <Route path="/tienda" element={<Shop />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <Footer />

        {/* Overlays */}
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          onOpenCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          todosLosProductos={todosLosProductos}
        />
        <AIChatbot />
        <Analytics />
      </div>
    </CartProvider>
  );
}

export default App;
