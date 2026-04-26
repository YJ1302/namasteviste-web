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
            <div className="social-links" aria-label="Redes sociales">
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="WhatsApp">💬</a>
            </div>
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

          {/* Admin / Ayuda */}
          <div>
            <div className="footer-col-title">Accesos</div>
            <nav className="footer-links" aria-label="Links de accesos">
              <Link to="/admin" className="footer-link">Admin Dashboard</Link>
              <a href="#" className="footer-link">Envíos y entregas</a>
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
