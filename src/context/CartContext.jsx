import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'redmont_cart';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, qty } = action.payload;
      const existingIndex = state.findIndex(
        item => item.product_id === product.id && item.size === size
      );
      if (existingIndex > -1) {
        const updated = [...state];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty
        };
        return updated;
      }
      return [...state, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity: qty,
      }];
    }
    case 'REMOVE_FROM_CART':
      return state.filter((_, index) => index !== action.payload);
    case 'UPDATE_QUANTITY': {
      const { index, change } = action.payload;
      const updated = [...state];
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity + change,
      };
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      return updated;
    }
    case 'CLEAR_CART':
      return [];
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size = 'M', qty = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, size, qty } });
  };

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const updateQuantity = (index, change) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, change } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
