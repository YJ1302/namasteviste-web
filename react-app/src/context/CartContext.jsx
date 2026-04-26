import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ntv_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    localStorage.setItem('ntv_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, qty = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [...prevCart, { ...item, qty }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prevCart) => {
      const nextCart = prevCart.map((c) => {
        if (c.id === id) {
          return { ...c, qty: c.qty + delta };
        }
        return c;
      });
      return nextCart.filter((c) => c.qty > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((c) => c.id !== id));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        return prev.filter((w) => w !== id);
      }
      return [...prev, id];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasFood = cart.some((item) => item.type === 'food');

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        changeQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        hasFood,
        wishlist,
        toggleWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
