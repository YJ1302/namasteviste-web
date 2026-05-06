import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import ItemModal from '../components/ItemModal';

export default function Shop() {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addToCart(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 5000);
  };

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

  // Simulated Natural Language Search mapping
  const searchKeywords = {
    'regalo': ['joya', 'ropa'],
    'novia': ['joya', 'ropa', 'henna'],
    'boda': ['henna', 'joya'],
    'tatuaje': ['henna'],
    'ropa': ['ropa'],
    'vestido': ['ropa']
  };

  const getSearchCategories = (query) => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();
    let categories = new Set();
    
    Object.keys(searchKeywords).forEach(key => {
      if (lowerQuery.includes(key)) {
        searchKeywords[key].forEach(cat => categories.add(cat));
      }
    });
    
    return categories.size > 0 ? Array.from(categories) : null;
  };

  const filteredProducts = shopProducts.filter(p => {
    // Filter by active category
    if (activeFilter !== 'todos' && p.category !== activeFilter) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const mappedCats = getSearchCategories(searchQuery);
      
      const matchesName = p.name.toLowerCase().includes(lowerQuery);
      const matchesDesc = p.desc?.toLowerCase().includes(lowerQuery);
      const matchesMappedCat = mappedCats && mappedCats.some(c => p.category.includes(c));
      
      if (!matchesName && !matchesDesc && !matchesMappedCat) return false;
    }
    
    return true;
  });

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
            <div className="sidebar-title">Búsqueda Inteligente 🤖</div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: algo para regalo, tatuaje..." 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>

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
            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p>Cargando catálogo...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-gold)', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>✨</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)', fontSize: '2rem', marginBottom: '12px' }}>Próximamente</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                  Estamos preparando una colección increíble para esta sección. ¡Vuelve pronto para descubrir nuestras nuevas prendas y accesorios traídos desde la India!
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product, index) => (
                  <article 
                    className="product-card" 
                    key={`${product.id}-${product.name}-${index}`}
                    onClick={() => setSelectedItem(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-img-wrap">
                      <img src={product.img} alt={product.name} loading="lazy" />
                      {product.hennaNotice && (
                        <div className="badge-notice">⚠️ Solo venta de productos — No incluye aplicación</div>
                      )}
                      <div className="product-overlay">
                        <div style={{ position: 'relative' }}>
                          <button className="overlay-btn" onClick={(e) => handleAddToCart(e, product)}><ShoppingCart size={18} /></button>
                          {addedItems[product.id] && (
                            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', background: '#43A047', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease-out', zIndex: 10 }}>
                              ¡Agregado!
                            </div>
                          )}
                        </div>
                        <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}><Heart size={18} /></button>
                      </div>
                      {product.badge && <span className={`product-badge ${product.badgeClass}`}>{product.badge}</span>}
                      <button 
                        className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
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
                        <div style={{ position: 'relative' }}>
                          <button className="quick-add-btn" onClick={(e) => handleAddToCart(e, product)}><Plus size={18}/></button>
                          {addedItems[product.id] && (
                            <div style={{ position: 'absolute', bottom: '100%', right: '0', marginBottom: '8px', background: '#43A047', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease-out' }}>
                              ¡Agregado!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={addToCart}
          isOrderingOpen={true} // Tienda siempre abierta para añadir al carrito
        />
      )}
    </section>
  );
}
