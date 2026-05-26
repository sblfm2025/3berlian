import { useCallback, useState } from 'react';

import { getRentableStock } from '../../../utils/stock';
import { getCartStockIssues } from '../utils/rentalValidation';

export const useRentalCart = ({ products, onCartWarning, onEmptyCart }) => {
  const [cart, setCart] = useState([]);

  const clearCart = useCallback(() => {
    setCart([]);
    onEmptyCart?.();
  }, [onEmptyCart]);

  const removeCartItem = useCallback((productId) => {
    setCart(currentCart => {
      const nextCart = currentCart.filter(item => item.product.id !== productId);
      if (nextCart.length === 0) onEmptyCart?.();
      return nextCart;
    });
  }, [onEmptyCart]);

  const updateCartQty = useCallback((product, delta) => {
    setCart(currentCart => {
      const existing = currentCart.find(item => item.product.id === product.id);

      const stockAvailable = getRentableStock(product);

      if (stockAvailable <= 0 && delta > 0) {
        onCartWarning?.(`Produk ${product.name} sedang habis.`);
        return currentCart;
      }

      if (!existing && delta > 0) {
        return [...currentCart, { product, qty: 1 }];
      }

      if (!existing) return currentCart;

      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const nextCart = currentCart.filter(item => item.product.id !== product.id);
        if (nextCart.length === 0) onEmptyCart?.();
        return nextCart;
      }

      if (nextQty > stockAvailable) {
        onCartWarning?.(`Stok ${product.name} tersisa ${stockAvailable} unit.`);
        return currentCart;
      }

      return currentCart.map(item => item.product.id === product.id ? { ...item, qty: nextQty } : item);
    });
  }, [onCartWarning, onEmptyCart]);

  const getStockIssue = useCallback(() => (
    getCartStockIssues({ cart, products })
  ), [cart, products]);

  return {
    cart,
    clearCart,
    getStockIssue,
    removeCartItem,
    setCart,
    updateCartQty
  };
};
