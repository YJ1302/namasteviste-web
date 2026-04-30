import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';

export default function Shop() {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShop = async () => {
      setLoading(true);
      const data = await sheetsService.getPublicShopInventory();
      const formattedData = data.map(item => ({
        id: item.ID,
        name: item.Nombre,
        desc: item.Descripcion,
        price: parseFloat(item.Precio) || 0,
        img: item.Imagen_URL || '/images/default_shop.png',
        category: (item.Categoria || '').toLowerCase(),
        type: 'shop',
        hennaNotice: (item.Categoria || '').toLowerCase() === 'henna',
        Puntos_Otorgados: parseInt(item.Puntos_Otorgados, 10) || 0
      }));
      setShopProducts(formattedData);
      setLoading(false);
    };
    loadShop();
  }, []);

  const filteredProducts = activeFilter === 'todos' ? shopProducts : shopProducts.filter(p => p.category === activeFilter);

  return (
    <section id="shop-section" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">👗 Nuestra Tienda</div>
          <h2 className="section-title">Ropa, Joyería y Henna</h2>
        </div>

        <div className="shop-layout">
          {/* Sidebar */}
          <aside className="shop-sidebar">
            <div className="sidebar-title">Filtrar por</div>
            <div className="filter-group">
              <div className="filter-options">
                {['todos', 'ropa', 'joyeria', 'henna'].map(cat => (
                  <button 
                    key={cat}
                    className={`filter-option ${activeFilter === cat ? 'active' : ''}`}
                    onClick={() => setActiveFilter(cat)}
                  >
                    <span className="filter-check">✓</span>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Henna Disclaimer Block */}
            <div style={{background: 'linear-gradient(135deg,rgba(78,52,46,.08),rgba(78,52,46,.04))', border: '1px solid rgba(78,52,46,.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '.78rem', color: 'var(--color-text-light)', lineHeight: 1.5, marginTop: 8}}>
              <div style={{fontWeight: 700, color: 'var(--color-brown)', marginBottom: 5}}>⚠️ Categoría Henna</div>
              Vendemos <strong>únicamente productos físicos</strong> de henna. <strong>No incluye aplicación profesional</strong>.
            </div>
          </aside>

          {/* Product Grid */}
          <div className="shop-main">
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <article className="product-card" key={`${product.id}-${product.name}-${index}`}>
                  <div className="product-img-wrap">
                    <img src={product.img} alt={product.name} loading="lazy" />
                    {product.hennaNotice && (
                      <div className="badge-notice">⚠️ Solo venta de productos — No incluye aplicación</div>
                    )}
                    <div className="product-overlay">
                      <button className="overlay-btn" onClick={() => addToCart(product)}><ShoppingCart size={18} /></button>
                      <button className="overlay-btn" onClick={() => toggleWishlist(product.id)}><Heart size={18} /></button>
                    </div>
                    {product.badge && <span className={`product-badge ${product.badgeClass}`}>{product.badge}</span>}
                    <button 
                      className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`} 
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="product-body">
                    <div className="product-cat">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price-row">
                      <div className="product-price">
                        {product.oldPrice && <span className="old-price">S/ {product.oldPrice.toFixed(2)}</span>}
                        S/ {product.price.toFixed(2)}
                      </div>
                      <button className="quick-add-btn" onClick={() => addToCart(product)}><Plus size={18}/></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
