import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useCart } from '../context/CartContext';
import { CalendarDays, ChefHat, Truck, UtensilsCrossed, Leaf, Drumstick } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { useOrderWindow } from '../components/CountdownTimer';
import ItemModal from '../components/ItemModal';
import Mandala from '../components/Mandala';
import SpiceParticles from '../components/SpiceParticles';
import OrderCountdown from '../components/OrderCountdown';
import DishCard from '../components/DishCard';
import { flyToCart } from '../utils/flyToCart';
import './Home.css';
import './FoodMenu.css';

const TABS = ['todos', 'platos', 'entradas', 'postres'];
const TAB_LABELS = { todos: 'Todo', platos: 'Platos', entradas: 'Entradas', postres: 'Postres' };
const DIETS = [
  { id: 'all', label: 'Todos', icon: UtensilsCrossed },
  { id: 'Vegetariano', label: 'Vegetariano', icon: Leaf },
  { id: 'No Vegetariano', label: 'No vegetariano', icon: Drumstick },
];
const PRESALE = [
  { icon: CalendarDays, title: 'Lunes a viernes', text: 'Haz tu pedido hasta el viernes al mediodía.' },
  { icon: ChefHat, title: 'Cocinamos fresco', text: 'Cerramos pedidos para garantizar la frescura de cada plato.' },
  { icon: Truck, title: 'Sábado o domingo', text: 'Recibe tu comida el fin de semana.' },
];
const LOADING_STEPS = [
  'Recolectando ingredientes frescos...',
  'Añadiendo especias de la India...',
  'Preparando con mucho amor...',
];

export default function FoodMenu() {
  const { addToCart } = useCart();
  const { isOrderingOpen } = useOrderWindow();
  const rootRef = useRef(null);
  const tabRefs = useRef({});
  const [activeTab, setActiveTab] = useState('todos');
  const [dietFilter, setDietFilter] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
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
    const timer1 = setTimeout(() => setAnimationStep(1), 1100);
    const timer2 = setTimeout(() => setAnimationStep(2), 2100);
    const timer3 = setTimeout(() => setShowAnimation(false), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const data = await sheetsService.getPublicFoodMenu();
      const formattedData = data.map(item => ({
        id: item.ID,
        name: item.Nombre,
        desc: item.Descripcion,
        price: parseFloat(item.Precio) || 0,
        images: item.Imagen_URL ? item.Imagen_URL.split(',').map(u => u.trim()) : ['/images/default_food.png'],
        img: item.Imagen_URL ? item.Imagen_URL.split(',')[0].trim() : '/images/default_food.png',
        category: (item.Categoria || '').toLowerCase(),
        type: 'food',
        rating: 4.8,
        Puntos_Otorgados: parseInt(item.Puntos_Otorgados, 10) || 0,
        dietType: item.Tipo_Dieta || ''
      }));
      setMenuItems(formattedData);
      setLoading(false);
    };
    loadMenu();
  }, []);

  const filteredItems = menuItems.filter(i => {
    const matchTab = activeTab === 'todos' || i.category === activeTab;
    const matchDiet = dietFilter === 'all' ? true : (dietFilter === 'Vegetariano' ? i.dietType === 'Vegetariano' : i.dietType !== 'Vegetariano');
    return matchTab && matchDiet;
  });

  const ready = !showAnimation && !loading;

  useLayoutEffect(() => {
    if (!ready) return;
    const measure = () => {
      const el = tabRefs.current[activeTab];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab, ready]);

  useEffect(() => {
    const els = rootRef.current.querySelectorAll('[data-reveal]:not(.in)');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready, activeTab, dietFilter]);

  return (
    <div className="mx fm" ref={rootRef}>
      <section className="fm-hero">
        <SpiceParticles density={40} />
        <Mandala variant="fm" />
        <div className="container fm-hero-inner">
          <div className="mx-kicker">Fin de semana de sabores</div>
          <h1 className="fm-title">Nuestro menú de <em>preventa</em></h1>
          <p className="fm-sub">Cada plato está preparado con ingredientes auténticos y recetas tradicionales.</p>
          <OrderCountdown />
        </div>
      </section>

      <section className="container fm-presale" aria-label="Cómo funciona la preventa">
        {PRESALE.map(({ icon: Icon, title, text }, i) => (
          <div className="fm-presale-item" key={title} data-reveal style={{ '--d': `${i * 0.1}s` }}>
            <span className="fm-presale-icon"><Icon size={22} strokeWidth={1.6} /></span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-section fm-menu">
        <div className="container">
          {!ready ? (
            <div className="fm-loader" role="status">
              <Mandala variant="loader" />
              <p key={animationStep} className="fm-loader-text">{LOADING_STEPS[animationStep]}</p>
            </div>
          ) : (
            <>
              <div className="fm-filters">
                <div className="mx-tabs" role="tablist" aria-label="Categorías">
                  <span className="mx-tab-ind" style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }} />
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      ref={(el) => { tabRefs.current[tab] = el; }}
                      role="tab"
                      aria-selected={activeTab === tab}
                      className={`mx-tab ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>

                <div className="fm-diet" role="group" aria-label="Tipo de dieta">
                  {DIETS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={`fm-diet-btn ${dietFilter === id ? 'active' : ''} ${id === 'Vegetariano' ? 'veg' : id === 'No Vegetariano' ? 'nonveg' : ''}`}
                      aria-pressed={dietFilter === id}
                      onClick={() => setDietFilter(id)}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-grid">
                {filteredItems.map((item, index) => (
                  <div data-reveal style={{ '--d': `${(index % 3) * 0.08}s` }} key={`${activeTab}-${dietFilter}-${item.id}-${index}`}>
                    <DishCard
                      dish={item}
                      open={isOrderingOpen}
                      added={addedItems[item.id]}
                      onAdd={handleAddToCart}
                      onOpen={setSelectedItem}
                    />
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && <p className="mx-empty">No hay platos con estos filtros por ahora.</p>}
            </>
          )}
        </div>
      </section>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
          isOrderingOpen={isOrderingOpen}
        />
      )}
    </div>
  );
}
