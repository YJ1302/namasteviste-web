import React, { useRef, useState } from 'react';
import { Plus, Check, Leaf, Heart, TriangleAlert, ImageOff } from 'lucide-react';

// Dark 3D-tilt product card used for dishes and shop items.
// Optional: `onOpen` opens the detail modal, `kicker` labels the category,
// `notice` adds a strip over the photo, `onWish`/`wished` show a wishlist heart.
export default function DishCard({ dish, open, added, onAdd, onOpen, kicker, notice, onWish, wished }) {
  const imgRef = useRef(null);
  const [broken, setBroken] = useState(false);

  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const reset = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      className={`mx-card ${onOpen ? 'is-clickable' : ''}`}
      onMouseMove={tilt}
      onMouseLeave={reset}
      onClick={onOpen ? () => onOpen(dish) : undefined}
    >
      <div className="mx-card-img">
        {broken
          ? <div className="mx-img-fallback" aria-label={dish.name}><ImageOff size={30} strokeWidth={1.4} /></div>
          : <img ref={imgRef} src={dish.img} alt={dish.name} loading="lazy" onError={() => setBroken(true)} />}
        <span className="mx-price">S/ {dish.price.toFixed(2)}</span>
        {dish.dietType === 'Vegetariano' && <span className="mx-veg"><Leaf size={13} /> Veggie</span>}
        {onWish && (
          <button
            className={`mx-wish ${wished ? 'active' : ''}`}
            aria-label={wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={!!wished}
            onClick={(e) => { e.stopPropagation(); onWish(dish.id); }}
          >
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
          </button>
        )}
        {notice && <span className="mx-notice"><TriangleAlert size={12} /> {notice}</span>}
      </div>
      <div className="mx-card-body">
        {kicker && <div className="mx-card-kicker">{kicker}</div>}
        <h3>{dish.name}</h3>
        <p>{dish.desc}</p>
        {open ? (
          <button
            className={`mx-add ${added ? 'done' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAdd(dish, imgRef.current); }}
          >
            {added ? <><Check size={16} /> En tu pedido</> : <><Plus size={16} /> Agregar</>}
          </button>
        ) : (
          <span className="mx-closed">Pedidos cerrados hasta el lunes</span>
        )}
      </div>
      <span className="mx-glare" aria-hidden="true" />
    </article>
  );
}
