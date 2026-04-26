import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="main-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="logo" aria-label="Namas-te-vistes — Inicio">
              <img src="/images/logo.jpg" alt="Namas-te-vistes Logo" className="logo-class" style={{ height: '60px', width: 'auto', borderRadius: '50%' }} />
              {/* <div className="logo-icon" aria-hidden="true">🪷</div> */}
              <div className="logo-text">
                <span className="logo-main" style={{color: 'var(--color-gold-lt)'}}>Namas-te-vistes</span>
                <span className="logo-sub" style={{color: 'rgba(255,255,255,.5)'}}>Moda de India, Estilo para Lima</span>
              </div>
            </Link>
            <p>Llevamos la magia del sur de Asia a tu hogar: moda auténtica, joyería artesanal, henna natural y los sabores más irresistibles de la cocina tradicional.</p>
            <div className="social-links" aria-label="Redes sociales" style={{ display: 'flex', gap: '12px' }}>
              
              <a href="https://www.tiktok.com/@namasteviste" className="social-link" aria-label="TikTok" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
              <a href="https://wa.me/51938828307" className="social-link" aria-label="WhatsApp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
          </div>

          {/* Menú */}
          <div>
            <div className="footer-col-title">Menú</div>
            <nav className="footer-links" aria-label="Links de menú">
              <Link to="/comida" className="footer-link">Platos</Link>
              <Link to="/comida" className="footer-link">Entradas</Link>
              <Link to="/comida" className="footer-link">Postres</Link>
            </nav>
          </div>

          {/* Tienda */}
          <div>
            <div className="footer-col-title">Tienda</div>
            <nav className="footer-links" aria-label="Links de tienda">
              <Link to="/tienda" className="footer-link">Ropa</Link>
              <Link to="/tienda" className="footer-link">Joyería</Link>
              <Link to="/tienda" className="footer-link">Henna</Link>
            </nav>
          </div>



          {/* Horarios */}
          <div>
            <div className="footer-col-title">Horarios de Pedidos</div>
            <div className="footer-hours" aria-label="Horarios">
              <div className="hour-row"><span className="hour-day">Lun – Vie</span><span className="hour-time">9:00 – 22:00</span></div>
              <div className="hour-row"><span className="hour-day">Pedidos cierran</span><span className="hour-time">Viernes 22:00</span></div>
              <div className="hour-row"><span className="hour-day">Sábado</span><span className="hour-time">Entregas ✅</span></div>
              <div className="hour-row"><span className="hour-day">Domingo</span><span className="hour-time">Entregas ✅</span></div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Namas-te-vistes. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
