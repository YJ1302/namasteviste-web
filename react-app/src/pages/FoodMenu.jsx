import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import CountdownTimer, { useOrderWindow } from '../components/CountdownTimer';
import ItemModal from '../components/ItemModal';

export default function FoodMenu() {
  const { addToCart } = useCart();
  const { isOrderingOpen } = useOrderWindow();
  const [activeTab, setActiveTab] = useState('todos');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const data = await sheetsService.getPublicFoodMenu();
      const formattedData = data.map(item => ({
        id: item.ID,
        name: item.Nombre,
        desc: item.Descripcion,
        price: parseFloat(item.Precio) || 0,
        img: item.Imagen_URL || '/images/default_food.png',
        category: (item.Categoria || '').toLowerCase(),
        type: 'food',
        rating: 4.8, // Default rating for simplicity
        Puntos_Otorgados: parseInt(item.Puntos_Otorgados, 10) || 0
      }));
      setMenuItems(formattedData);
      setLoading(false);
    };
    loadMenu();
  }, []);

  const filteredItems = activeTab === 'todos' ? menuItems : menuItems.filter(i => i.category === activeTab);

  return (
    <section id="menu-section" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">🍛 Fin de Semana de Sabores</div>
          <h2 className="section-title">Nuestro Menú de Preventa</h2>
          <p className="section-desc">Cada plato está preparado con ingredientes auténticos y recetas tradicionales.</p>
        </div>

        <CountdownTimer />

        <div className="presale-banner">
          <div className="presale-icon">📅</div>
          <div className="presale-banner-text">
            <h3>¿Cómo funciona la preventa?</h3>
            <p>Haz tu pedido de <span className="highlight-gold">lunes a viernes</span>. Cerramos pedidos el <span className="highlight-gold">viernes</span> para garantizar la frescura de cada plato. Recibe tu comida el sábado o domingo.</p>
          </div>
        </div>

        <div className="menu-tabs">
          {['todos', 'platos', 'entradas', 'postres'].map(tab => (
            <button 
              key={tab}
              className={`menu-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item, index) => (
            <article 
              className="menu-card" 
              key={`${item.id}-${item.name}-${index}`} 
              onClick={() => setSelectedItem(item)} 
              style={{ cursor: 'pointer' }}
            >
              <div className="menu-card-img">
                <img src={item.img} alt={item.name} loading="lazy" />
                {item.badge && <span className={`menu-card-badge ${item.badgeClass}`}>{item.badge}</span>}
                <div className="rating-badge">⭐ {item.rating}</div>
              </div>
              <div className="menu-card-body">
                <h3 className="menu-card-name">{item.name}</h3>
                <p className="menu-card-desc">{item.desc}</p>
                <div className="menu-card-footer">
                  <div className="menu-price">
                    {item.oldPrice && <span>S/ {item.oldPrice.toFixed(2)}</span>}
                    S/ {item.price.toFixed(2)}
                  </div>
                  {isOrderingOpen ? (
                    <button 
                      className="add-to-cart-btn" 
                      onClick={(e) => { e.stopPropagation(); addToCart(item); }} 
                      aria-label="Añadir a carrito"
                    >
                      <Plus size={20} />
                    </button>
                  ) : (
                    <button className="add-to-cart-btn" disabled style={{ background: '#d1d1d1', color: '#6e6e6e', cursor: 'not-allowed', width: 'auto', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                      Cerrado
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={addToCart}
          isOrderingOpen={isOrderingOpen}
        />
      )}
    </section>
  );
}
