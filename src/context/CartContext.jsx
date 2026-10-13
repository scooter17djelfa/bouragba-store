import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const getItemKey = (item) => {
  if (!item) return '';
  if (item.cartItemId) return String(item.cartItemId);
  if (item.variant) {
    const vKey = item.variant.id || item.variant.name || '';
    return `${item.id}-${vKey}`;
  }
  return String(item.id);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadKey = getItemKey(action.payload);
      const qtyToAdd = action.payload.qty || 1;
      const exists = state.items.find(i => getItemKey(i) === payloadKey);

      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            getItemKey(i) === payloadKey ? { ...i, qty: i.qty + qtyToAdd } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cartItemId: payloadKey, qty: qtyToAdd }]
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => getItemKey(i) !== String(action.payload))
      };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          getItemKey(i) === String(action.payload.id)
            ? { ...i, qty: action.payload.qty }
            : i
        ).filter(i => i.qty > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
};

const initialState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  isOpen: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const addItem = (product, qty = 1) => dispatch({ type: 'ADD_ITEM', payload: { ...product, qty } });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      toggleCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
