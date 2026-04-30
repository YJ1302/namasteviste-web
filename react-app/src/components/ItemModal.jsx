import React, { useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const ItemModal = ({ item, onClose, onAddToCart, isOrderingOpen = true }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!item) return null;

  return (
    <div className="item-modal-overlay" onClick={onClose}>
      <div className="item-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="item-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="item-modal-layout">
          <div className="item-modal-img-container">
            <img src={item.img} alt={item.name} loading="lazy" />
          </div>
          <div className="item-modal-details">
            <div className="item-modal-category">{item.category}</div>
            <h2 className="item-modal-title">{item.name}</h2>
            <div className="item-modal-price">
              {item.oldPrice && <span className="old-price" style={{textDecoration: 'line-through', color: '#888', fontSize: '1.1rem'}}>S/ {item.oldPrice.toFixed(2)}</span>}
              S/ {item.price.toFixed(2)}
            </div>
            <p className="item-modal-description">{item.desc || "Sin descripción disponible."}</p>
            {item.Puntos_Otorgados > 0 && (
              <div className="item-modal-points">
                💎 Otorga <strong>{item.Puntos_Otorgados} puntos</strong>
              </div>
            )}
            {item.hennaNotice && (
              <div className="badge-notice" style={{marginTop: '1rem', marginBottom: '1rem', padding: '12px', background: 'rgba(78,52,46,0.1)', color: 'var(--color-brown)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem'}}>
                ⚠️ Solo venta de productos — No incluye aplicación
              </div>
            )}
            <div className="item-modal-actions">
              {isOrderingOpen ? (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '15px' }}
                  onClick={() => {
                    onAddToCart(item);
                    onClose();
                  }}
                >
                  <Plus size={20} /> Añadir al Carrito
                </button>
              ) : (
                <button 
                  className="btn" 
                  disabled 
                  style={{ width: '100%', background: '#d1d1d1', color: '#6e6e6e', cursor: 'not-allowed', padding: '15px' }}
                >
                  Cerrado para pedidos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
