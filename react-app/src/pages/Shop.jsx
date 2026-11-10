import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Sparkles, TriangleAlert, ArrowRight } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import ItemModal from '../components/ItemModal';
import Mandala from '../components/Mandala';
import DishCard from '../components/DishCard';
import { flyToCart } from '../utils/flyToCart';
import './Home.css';
import './FoodMenu.css';

const FILTERS = ['todos', 'ropa', 'joyeria', 'henna'];
const FILTER_LABELS = { todos: 'Todo', ropa: 'Ropa', joyeria: 'Joyería', henna: 'Henna' };
const HENNA_NOTICE = 'Solo venta de productos — No incluye aplicación';

export default function Shop() {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const rootRef = useRef(null);
  const tabRefs = useRef({});
  const [activeFilter, setActiveFilter] = useState('todos');
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const handleAddToCart = (item, img) => {
    addToCart(item);
    flyToCart(img);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2500);
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
        images: item.Imagen_URL ? item.Imagen_URL.split(',').map(u => u.trim()) : ['/images/default_shop.png'],
        img: item.Imagen_URL ? item.Imagen_URL.split(',')[0].trim() : '/images/default_shop.png',
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

  const filteredProducts = shopProducts.filter(p => activeFilter === 'todos' || p.category === activeFilter);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeFilter];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeFilter]);

  useEffect(() => {
    const els = rootRef.current.querySelectorAll('[data-reveal]:not(.in)');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, activeFilter]);

  return (
    <div className="mx fm shop" ref={rootRef}>
      <section className="fm-hero shop-hero">
        <Mandala variant="fm" />
        <div className="container fm-hero-inner">
          <div className="mx-kicker">Nuestra tienda</div>
          <h1 className="fm-title">Ropa, joyería <em>y henna</em></h1>
          <p className="fm-sub">Kurtas bordados, jhumkas, bangles y henna natural, traídos de la India para completar tu fiesta.</p>
        </div>
      </section>

      <section className="mx-section fm-menu">
        <div className="container">
          <div className="fm-filters">
            <div className="mx-tabs" role="tablist" aria-label="Categorías">
              <span className="mx-tab-ind" style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }} />
              {FILTERS.map(cat => (
                <button
                  key={cat}
                  ref={(el) => { tabRefs.current[cat] = el; }}
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`mx-tab ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {FILTER_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="shop-note">
              <TriangleAlert size={15} />
              <span>Henna: vendemos <strong>únicamente productos físicos</strong>. No incluye aplicación.</span>
            </div>
          </div>

          {loading ? (
            <div className="mx-grid">{[0, 1, 2].map((i) => <div className="mx-skel" key={i} />)}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="shop-empty" data-reveal>
              <Sparkles size={44} strokeWidth={1.4} />
              <h3>Próximamente</h3>
              <p>Estamos preparando una colección increíble para esta sección. ¡Vuelve pronto para descubrir nuestras nuevas prendas y accesorios traídos desde la India!</p>
              <Link to="/comida" className="mx-btn mx-btn-line">Mientras tanto, mira la carta <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <div className="mx-grid">
              {filteredProducts.map((product, index) => (
                <div data-reveal style={{ '--d': `${(index % 3) * 0.08}s` }} key={`${activeFilter}-${product.id}-${index}`}>
                  <DishCard
                    dish={product}
                    open
                    added={addedItems[product.id]}
                    onAdd={handleAddToCart}
                    onOpen={setSelectedItem}
                    kicker={FILTER_LABELS[product.category] || product.category}
                    notice={product.hennaNotice ? HENNA_NOTICE : null}
                    onWish={toggleWishlist}
                    wished={wishlist.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
          isOrderingOpen={true} // Tienda siempre abierta para añadir al carrito
        />
      )}
    </div>
  );
}
