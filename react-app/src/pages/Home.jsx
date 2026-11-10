import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Leaf, ShoppingBasket, ChefHat, Truck, UtensilsCrossed } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { useCart } from '../context/CartContext';
import { useOrderWindow } from '../components/CountdownTimer';
import Mandala from '../components/Mandala';
import SpiceParticles from '../components/SpiceParticles';
import OrderCountdown from '../components/OrderCountdown';
import DishCard from '../components/DishCard';
import { flyToCart } from '../utils/flyToCart';
import './Home.css';

const TITLE = [['Hecho', 'con'], ['fuego,', 'especias'], ['y', 'amor.']];
const TAB_LABELS = { todos: 'Todo', platos: 'Platos', entradas: 'Entradas', postres: 'Postres' };
const STEPS = [
  { icon: ShoppingBasket, when: 'Lunes – Viernes', title: 'Elige', text: 'Arma tu pedido con la carta de la semana antes del viernes al mediodía.' },
  { icon: ChefHat, when: 'En nuestra cocina', title: 'Cocinamos', text: 'Especias auténticas, recetas tradicionales y fuego lento.' },
  { icon: Truck, when: 'Sábado o Domingo', title: 'Disfruta', text: 'Recibes tu pedido el fin de semana, listo para compartir.' },
];
const SHOP_IMAGES = ['/images/indian_clothing.png', '/images/indian_jewelry.png', '/images/henna_products.png'];

const magnet = {
  onMouseMove: (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
  },
  onMouseLeave: (e) => { e.currentTarget.style.transform = ''; },
};

function RotatingBadge({ id, className = '' }) {
  return (
    <div className={`mx-badge ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs><path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text><textPath href={`#${id}`} textLength="480" lengthAdjust="spacing">COCINA INDIA • FIN DE SEMANA • LIMA •</textPath></text>
      </svg>
      <span><UtensilsCrossed size={26} strokeWidth={1.75} /></span>
    </div>
  );
}

export default function Home() {
  const { addToCart } = useCart();
  const { isOrderingOpen } = useOrderWindow();
  const rootRef = useRef(null);
  const tabRefs = useRef({});
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [added, setAdded] = useState({});

  useEffect(() => {
    (async () => {
      const data = await sheetsService.getPublicFoodMenu();
      setDishes(data.map((item) => ({
        id: item.ID,
        name: item.Nombre,
        desc: item.Descripcion,
        price: parseFloat(item.Precio) || 0,
        img: item.Imagen_URL ? item.Imagen_URL.split(',')[0].trim() : '/images/thali_combo.png',
        category: (item.Categoria || '').toLowerCase(),
        type: 'food',
        rating: 4.8,
        Puntos_Otorgados: parseInt(item.Puntos_Otorgados, 10) || 0,
        dietType: item.Tipo_Dieta || '',
      })));
      setLoading(false);
    })();
  }, []);

  // Scroll position drives the plate rotation
  useEffect(() => {
    const root = rootRef.current;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => root.style.setProperty('--sy', String(window.scrollY)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const tabs = ['todos', ...['platos', 'entradas', 'postres'].filter((c) => dishes.some((d) => d.category === c))];
  const shown = dishes.filter((d) => activeTab === 'todos' || d.category === activeTab).slice(0, 6);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeTab];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab, tabs.length]);

  // Reveal-on-scroll
  useEffect(() => {
    const els = rootRef.current.querySelectorAll('[data-reveal]:not(.in)');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, activeTab]);

  const onHeroMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty('--mx-x', `${x * 100}%`);
    s.setProperty('--mx-y', `${y * 100}%`);
    s.setProperty('--px', (x - 0.5).toFixed(3));
    s.setProperty('--py', (y - 0.5).toFixed(3));
  };

  const handleAdd = (dish, img) => {
    addToCart(dish);
    flyToCart(img);
    setAdded((p) => ({ ...p, [dish.id]: true }));
    setTimeout(() => setAdded((p) => ({ ...p, [dish.id]: false })), 2200);
  };

  return (
    <div className="mx" ref={rootRef}>
      {/* HERO */}
      <section className="mx-hero" onMouseMove={onHeroMove} aria-labelledby="hero-heading">
        <SpiceParticles />
        <div className="mx-spot" aria-hidden="true" />

        <div className="container mx-hero-inner">
          <div className="mx-copy">
            <div className="mx-eyebrow"><span className="mx-dot" />Cocina india en Lima · Solo fines de semana</div>

            <h1 className="mx-title" id="hero-heading">
              {TITLE.map((line, li) => (
                <span className="mx-line" key={li}>
                  {line.map((w, wi) => (
                    <span className="mx-w" key={w}>
                      <span
                        className={w === 'fuego,' ? 'mx-fire' : w === 'amor.' ? 'mx-love' : ''}
                        style={{ '--d': `${0.25 + (li * 2 + wi) * 0.1}s` }}
                      >
                        {w}
                        {w === 'amor.' && (
                          <svg className="mx-squiggle" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M4 14 C 30 2, 50 2, 70 12 S 110 22, 130 10 S 170 2, 196 10" />
                          </svg>
                        )}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="mx-sub">
              Butter chicken, chana masala, gulab jamun y más, con especias auténticas y recetas
              tradicionales. Pides de lunes a viernes y el fin de semana llega a tu puerta.
            </p>

            <OrderCountdown />

            <div className="mx-actions">
              <Link to="/comida" className="mx-btn mx-btn-fire" {...magnet}>Armar mi pedido <ArrowRight size={18} /></Link>
              <a href="#carta" className="mx-btn mx-btn-ghost">Ver la carta</a>
            </div>
          </div>

          <div className="mx-stage">
            <Mandala variant="mx" />
            <svg className="mx-steam" viewBox="0 0 120 160" aria-hidden="true">
              <path d="M30 150 C 10 120, 50 100, 30 70 S 40 20, 30 0" />
              <path d="M60 150 C 40 120, 80 100, 60 70 S 70 20, 60 0" />
              <path d="M90 150 C 70 120, 110 100, 90 70 S 100 20, 90 0" />
            </svg>
            <div className="mx-plate"><img src="/images/thali_combo.png" alt="Thali con curries, arroz y naan" /></div>
            <div className="mx-tag mx-tag-a"><Flame size={15} /> Recién hecho</div>
            <div className="mx-tag mx-tag-b"><Leaf size={15} /> Opciones veggie</div>
            <RotatingBadge id="mx-circle-hero" className="mx-badge-hero" />
          </div>
        </div>

        <a href="#carta" className="mx-scroll" aria-label="Ir a la carta">Desliza<span /></a>
      </section>

      {/* MENU */}
      <section className="mx-section" id="carta">
        <div className="container">
          <div className="mx-head" data-reveal>
            <div>
              <div className="mx-kicker">La carta de esta semana</div>
              <h2 className="mx-h2">Elige tu <em>antojo</em></h2>
            </div>
            {tabs.length > 1 && (
              <div className="mx-tabs" role="tablist">
                <span className="mx-tab-ind" style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }} />
                {tabs.map((t) => (
                  <button
                    key={t}
                    ref={(el) => { tabRefs.current[t] = el; }}
                    role="tab"
                    aria-selected={activeTab === t}
                    className={`mx-tab ${activeTab === t ? 'active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {TAB_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mx-grid">
            {loading
              ? [0, 1, 2].map((i) => <div className="mx-skel" key={i} />)
              : shown.map((d, i) => (
                <div data-reveal style={{ '--d': `${i * 0.08}s` }} key={`${activeTab}-${d.id}-${i}`}>
                  <DishCard dish={d} open={isOrderingOpen} added={added[d.id]} onAdd={handleAdd} />
                </div>
              ))}
          </div>
          {!loading && shown.length === 0 && <p className="mx-empty">Muy pronto publicamos la carta de esta semana.</p>}

          <div className="mx-center" data-reveal>
            <Link to="/comida" className="mx-btn mx-btn-line">Ver menú completo <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-section mx-how">
        <div className="container">
          <div className="mx-head center" data-reveal>
            <div className="mx-kicker">Así de fácil</div>
            <h2 className="mx-h2">De nuestra cocina <em>a tu mesa</em></h2>
          </div>
          <div className="mx-steps" data-reveal>
            {STEPS.map(({ icon: Icon, when, title, text }, i) => (
              <div className="mx-step" key={title} style={{ '--d': `${0.25 + i * 0.25}s` }}>
                <div className="mx-step-num" aria-hidden="true">0{i + 1}</div>
                <div className="mx-step-icon"><Icon size={38} strokeWidth={1.5} /></div>
                <div className="mx-step-when">{when}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-final">
        <Mandala variant="mx-final" />
        <div className="container mx-final-inner" data-reveal>
          <h2 className="mx-final-title">¿Ya se te<br /><em>antojó?</em></h2>
          <p>Pide antes del viernes al mediodía y recíbelo este fin de semana.</p>
          <Link to="/comida" className="mx-btn mx-btn-fire mx-btn-big" {...magnet}>Armar mi pedido <ArrowRight size={20} /></Link>
          <RotatingBadge id="mx-circle-final" className="mx-badge-final" />
        </div>
      </section>

      {/* SHOP — secondary */}
      <section className="mx-shop">
        <div className="container">
          <Link to="/tienda" className="mx-shop-inner" data-reveal>
            <div className="mx-fan" aria-hidden="true">
              {SHOP_IMAGES.map((src, i) => <img key={src} src={src} alt="" loading="lazy" style={{ '--i': i - 1 }} />)}
            </div>
            <div className="mx-shop-copy">
              <div className="mx-kicker">Y para vestir la fiesta</div>
              <h3>Moda, joyería y henna de la India</h3>
            </div>
            <span className="mx-btn mx-btn-line">Visitar la tienda <ArrowRight size={16} /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
