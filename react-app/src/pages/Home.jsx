import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, ShoppingBag } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';

export default function Home() {
  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const bgs = await sheetsService.getAllBackgrounds();
        if (bgs && bgs.length > 0) {
          setBackgrounds(bgs.map(b => b.Imagen_URL));
        }
      } catch (e) {
        console.error("Error fetching backgrounds", e);
      }
    };
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  return (
    <>
      <section id="hero" aria-labelledby="hero-heading">
        {backgrounds.length > 0 ? (
          backgrounds.map((bg, idx) => (
            <div 
              key={idx}
              className="hero-bg" 
              aria-hidden="true"
              style={{
                backgroundImage: `url(${bg})`,
                opacity: idx === currentBgIndex ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out, transform 8s ease'
              }}
            ></div>
          ))
        ) : (
          <div className="hero-bg" aria-hidden="true"></div>
        )}
        <div className="hero-overlay" aria-hidden="true"></div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              Cultura del India
            </div>
            <h1 className="hero-title" id="hero-heading">
              Donde la moda
              <span className="accent">se encuentra con el sabor</span>
            </h1>
            <p className="hero-subtitle">
              Descubre ropa, joyería y productos de henna auténticos. Y cada fin de semana, 
              disfruta de nuestra cocina tradicional hecha con amor. Pide de lunes a viernes, 
              recibe el sábado o domingo.
            </p>
            <div className="hero-actions">
              <Link to="/tienda" className="btn btn-teal btn-xl">
                Explorar Ahora
              </Link>
              <Link to="/comida" className="btn btn-ghost btn-xl">
                🍛 Ver Menú
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TWO WORLDS */}
      <section id="two-worlds" className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Nuestros Mundos</div>
            <h2 className="section-title">Todo lo que amas del Sur de Asia,<br/>en un solo lugar</h2>
            <p className="section-desc">Explora nuestra tienda de moda y cultura, o sumérgete en los sabores tradicionales de nuestro menú de preventa de fin de semana.</p>
          </div>

          <div className="two-worlds-grid">
            <Link to="/tienda" className="world-card">
              <img className="world-card-img" src="/images/indian_clothing.png" alt="Ropa, joyería y henna del sur de Asia" loading="lazy" />
              <div className="world-card-overlay" aria-hidden="true"></div>
              <div className="world-card-content">
                <div className="world-card-tag">Tienda</div>
                <h3 className="world-card-title">Ropa, Joyería<br/>y Henna</h3>
                <p className="world-card-desc">Kurtas bordados, jhumkas doradas, bangles y kits de henna natural. Auténtico estilo del sur de Asia.</p>
                <div className="btn btn-gold btn-sm"><ShoppingBag size={14} style={{marginRight: 4}}/> Ver Productos →</div>
              </div>
            </Link>

            <Link to="/comida" className="world-card">
              <img className="world-card-img" src="/images/thali_combo.png" alt="Comida tradicional del sur de Asia" loading="lazy" />
              <div className="world-card-overlay" aria-hidden="true"></div>
              <div className="world-card-content">
                <div className="world-card-tag">Fin de Semana de Sabores</div>
                <h3 className="world-card-title">Cocina<br/>Tradicional</h3>
                <p className="world-card-desc">Butter Chicken, Chana Masala, Gulab Jamun y más. Pide entre semana, disfruta el fin de semana.</p>
                <div className="btn btn-primary btn-sm"><Utensils size={14} style={{marginRight: 4}}/> Ver Menú →</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
