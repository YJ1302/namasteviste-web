import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, Menu, X, Award } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';

export default function Header({ onOpenCart }) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showPointsModal, setShowPointsModal] = useState(false);
  const [phoneToCheck, setPhoneToCheck] = useState('');
  const [pointsResult, setPointsResult] = useState(null);
  const [isCheckingPoints, setIsCheckingPoints] = useState(false);

  const handleCheckPoints = async (e) => {
    e.preventDefault();
    if (!phoneToCheck) return;
    setIsCheckingPoints(true);
    setPointsResult(null);
    const telClean = phoneToCheck.replace(/\D/g, '');
    const cliente = await sheetsService.getClientePuntos(telClean);
    if (cliente) {
      setPointsResult({ found: true, puntos: cliente.Puntos_Acumulados, nombre: cliente.Nombre_Cliente });
    } else {
      setPointsResult({ found: false });
    }
    setIsCheckingPoints(false);
  };

  return (
    <>
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
          <button className="icon-btn" aria-label="Consultar Puntos" onClick={() => setShowPointsModal(true)} title="Mis Puntos">
            <Award size={20} />
          </button>
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

      {/* Points Checking Modal */}
      {showPointsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: 'var(--color-white)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '400px', maxWidth: '90%', position: 'relative' }}>
            <button onClick={() => { setShowPointsModal(false); setPointsResult(null); setPhoneToCheck(''); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}>
              <X size={24} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-lt))', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', color: 'var(--color-dark-warm)' }}>
                <Award size={28} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)', fontSize: '1.4rem' }}>Consulta tus Puntos</h2>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>Ingresa tu celular para ver tus puntos acumulados.</p>
            </div>

            <form onSubmit={handleCheckPoints}>
              <input 
                type="tel" 
                value={phoneToCheck} 
                onChange={(e) => setPhoneToCheck(e.target.value)} 
                className="form-control" 
                placeholder="Ej. 987654321 (sin código)" 
                required 
                style={{ marginBottom: '16px', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.05em' }}
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={isCheckingPoints}>
                {isCheckingPoints ? 'Buscando...' : 'Consultar Puntos'}
              </button>
            </form>

            {pointsResult && (
              <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: pointsResult.found ? 'var(--color-cream)' : '#FEF2F2', textAlign: 'center' }}>
                {pointsResult.found ? (
                  <>
                    <h3 style={{ color: 'var(--color-burgundy)', fontSize: '1.1rem', marginBottom: '8px' }}>¡Hola {pointsResult.nombre || 'Namas-Lover'}!</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {pointsResult.puntos}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Puntos acumulados</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: '#DC2626', fontWeight: 600, marginBottom: '4px' }}>No encontrado</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>No tenemos registros de puntos para este número. ¡Haz tu primer pedido para empezar a ganar!</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
