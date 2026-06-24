"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCart = sessionStorage.getItem('nelcyra_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart storage: ", e);
    }
  }, []);

  const addToCart = (item) => {
    setCartItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const updated = [...prev, item];
      sessionStorage.setItem('nelcyra_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartItemMeta = (id, field, value) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      );
      sessionStorage.setItem('nelcyra_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      sessionStorage.setItem('nelcyra_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('nelcyra_cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateCartItemMeta, removeFromCart, clearCart, isCartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}