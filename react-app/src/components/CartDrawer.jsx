import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';

const crossSellItems = [
  { id: 'hn-001', name: 'Kit Henna Natural', price: 18.90, img: '/images/henna_products.png', type: 'shop' },
  { id: 'jw-001', name: 'Jhumka Doradas',    price: 34.50, img: '/images/indian_jewelry.png', type: 'shop' },
];

export default function CartDrawer({ isOpen, onClose, onOpenCheckout }) {
  const { cart, cartTotal, changeQty, removeFromCart, hasFood, addToCart } = useCart();

  return (
    <>
      <div 
        id="cart-overlay" 
        className={isOpen ? 'open' : ''} 
        aria-hidden="true" 
        onClick={onClose}
      />
      <aside 
        id="cart-drawer" 
        className={isOpen ? 'open' : ''} 
        role="complementary" 
        aria-label="Carrito de compras"
      >
        <div className="cart-header">
          <h2><ShoppingCart size={20} /> Tu Carrito</h2>
          <button className="close-cart" onClick={onClose} aria-label="Cerrar carrito">
            <X size={20} />
          </button>
        </div>
        
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={48} style={{ opacity: 0.4 }} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img className="cart-item-img" src={item.img} alt={item.name} loading="lazy" />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-variant">
                      {item.type === 'food' ? '🍽️ Pedido de fin de semana' : '📦 Producto tienda'}
                    </div>
                    <div className="cart-item-controls">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => changeQty(item.id, -1)} aria-label="Disminuir cantidad"><Minus size={14}/></button>
                        <span className="qty-num">{item.qty}</span>
                        <button className="qty-btn" onClick={() => changeQty(item.id, 1)} aria-label="Aumentar cantidad"><Plus size={14}/></button>
                      </div>
                      <button className="remove-item" onClick={() => removeFromCart(item.id)} aria-label="Eliminar">
                        <Trash2 size={14} style={{display:'inline', marginRight:4}} /> Quitar
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">S/ {(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}

              {hasFood && (
                <div className="crosssell-section" style={{marginTop: 20}}>
                  <div className="crosssell-title">✨ ¡Aprovecha el envío!</div>
                  <div className="crosssell-subtitle">Agrega productos de la tienda a tu pedido de comida sin costo extra de envío.</div>
                  <div className="crosssell-items">
                    {crossSellItems.map(cs => (
                      <div className="crosssell-item" key={cs.id} onClick={() => addToCart(cs)}>
                        <img className="crosssell-img" src={cs.img} alt={cs.name} loading="lazy" />
                        <div className="crosssell-info">
                          <div className="crosssell-name">{cs.name}</div>
                          <div className="crosssell-price">S/ {cs.price.toFixed(2)}</div>
                        </div>
                        <button className="crosssell-add" aria-label={`Agregar ${cs.name}`}>+</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>S/ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <span>S/ {cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={onOpenCheckout}>
              Finalizar Pedido →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
