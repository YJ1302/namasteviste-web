import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, Menu, X } from 'lucide-react';

export default function Header({ onOpenCart }) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="main-header" role="banner" className="scrolled">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="Namas-te-vistes — Inicio">
          <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <img src="/images/logo.jpg" alt="Namas-te-vistes Logo" className="logo-class" style={{ height: '60px', width: 'auto', borderRadius: '50%' }} />
             {/* <div className="logo-icon" aria-hidden="true">🪷</div> */}
             <div className="logo-text">
               <span className="logo-main">Namas-te-vistes</span>
               <span className="logo-sub">Moda de India, Estilo para Lima</span>
             </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav" role="navigation" aria-label="Navegación principal">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Inicio</NavLink>
          <NavLink to="/tienda" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Tienda</NavLink>
          <NavLink to="/comida" className={({isActive}) => `nav-link nav-food ${isActive ? 'active' : ''}`}>🍛 Fin de Semana de Sabores</NavLink>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button className="icon-btn" aria-label="Lista de deseos">
            <Heart size={20} />
          </button>
          <button className="icon-btn" aria-label="Carrito de compras" onClick={onOpenCart}>
            <ShoppingCart size={20} />
            <span className={`cart-badge ${cartCount > 0 ? 'visible' : ''}`} aria-label="Artículos en el carrito">
              {cartCount}
            </span>
          </button>
          <button className="menu-toggle" aria-label="Abrir menú" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav id="mobile-nav" className={`mobile-nav container ${mobileMenuOpen ? 'open' : ''}`} aria-label="Navegación móvil">
        <NavLink to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>🏠 Inicio</NavLink>
        <NavLink to="/tienda" className="nav-link" onClick={() => setMobileMenuOpen(false)}>👗 Tienda</NavLink>
        <NavLink to="/comida" className="nav-link nav-food" onClick={() => setMobileMenuOpen(false)}>🍛 Fin de Semana de Sabores</NavLink>
      </nav>
    </header>
  );
}
