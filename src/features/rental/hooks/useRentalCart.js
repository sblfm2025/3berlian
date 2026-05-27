import { useCallback, useState } from 'react';

import { getRentableStock } from '../../../utils/stock';
import { getCartStockIssues } from '../utils/rentalValidation';

const getProductVariants = (product = {}) => {
  if (Array.isArray(product.variants) && product.variants.length > 0) return product.variants;

  return [{
    id: `${product.id || 'product'}-${product.size || 'default'}`,
    size: product.size || 'All Size',
    color: product.color || '',
    rentPrice: Number(product.rentPrice || 0),
    deposit: Number(product.deposit || 0),
    stockAvailable: getRentableStock(product)
  }];
};

const buildCartItem = (product, variant = {}, qty = 1) => {
  const size = variant.size || product.size || 'All Size';
  const color = variant.color || product.color || '';
  const safeQty = Math.max(1, Number(qty || 1));
  const rentPrice = Number(variant.rentPrice ?? product.rentPrice ?? 0);

  return {
    cartItemId: `${product.id}-${size}-${color || 'default'}`,
    product,
    productId: product.id,
    productName: product.name,
    sku: product.sku || product.id,
    size,
    color,
    variantId: variant.id || variant.variantId || '',
    qty: safeQty,
    rentPrice,
    deposit: Number(variant.deposit ?? product.deposit ?? 0),
    discount: 0,
    subtotal: rentPrice * safeQty,
    note: ''
  };
};

export const useRentalCart = ({ products, onCartWarning, onEmptyCart }) => {
  const [cart, setCart] = useState([]);

  const clearCart = useCallback(() => {
    setCart([]);
    onEmptyCart?.();
  }, [onEmptyCart]);

  const removeCartItem = useCallback((itemId) => {
    setCart(currentCart => {
      const nextCart = currentCart.filter(item => (item.cartItemId || item.product.id) !== itemId && item.product.id !== itemId);
      if (nextCart.length === 0) onEmptyCart?.();
      return nextCart;
    });
  }, [onEmptyCart]);

  const updateCartQty = useCallback((product, delta, variant) => {
    setCart(currentCart => {
      const selectedVariant = variant || getProductVariants(product)[0];
      const initialQty = Math.max(1, Number(delta || 1));
      const nextCartItem = buildCartItem(product, selectedVariant, initialQty);
      const existing = currentCart.find(item => (item.cartItemId || item.product.id) === nextCartItem.cartItemId);

      const stockAvailable = Number(selectedVariant.stockAvailable ?? selectedVariant.availableStock ?? getRentableStock(product));

      if (stockAvailable <= 0 && delta > 0) {
        onCartWarning?.(`Produk ${product.name} sedang habis.`);
        return currentCart;
      }

      if (!existing && delta > 0) {
        if (initialQty > stockAvailable) {
          onCartWarning?.(`Stok ${product.name} tersisa ${stockAvailable} unit.`);
          return currentCart;
        }
        return [...currentCart, nextCartItem];
      }

      if (!existing) return currentCart;

      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const nextCart = currentCart.filter(item => (item.cartItemId || item.product.id) !== nextCartItem.cartItemId);
        if (nextCart.length === 0) onEmptyCart?.();
        return nextCart;
      }

      if (nextQty > stockAvailable) {
        onCartWarning?.(`Stok ${product.name} tersisa ${stockAvailable} unit.`);
        return currentCart;
      }

      return currentCart.map(item => (
        (item.cartItemId || item.product.id) === nextCartItem.cartItemId
          ? {
            ...item,
            qty: nextQty,
            subtotal: Math.max(0, (Number(item.rentPrice ?? item.product?.rentPrice ?? 0) * nextQty) - Number(item.discount || 0))
          }
          : item
      ));
    });
  }, [onCartWarning, onEmptyCart]);

  const updateCartItem = useCallback((itemId, updates) => {
    setCart(currentCart => currentCart.map(item => {
      if ((item.cartItemId || item.product.id) !== itemId) return item;

      const nextItem = {
        ...item,
        ...updates
      };
      const qty = Math.max(1, Number(nextItem.qty || 1));
      const rentPrice = Math.max(0, Number(nextItem.rentPrice || 0));
      const discount = Math.max(0, Number(nextItem.discount || 0));

      return {
        ...nextItem,
        qty,
        rentPrice,
        deposit: Math.max(0, Number(nextItem.deposit || 0)),
        subtotal: Math.max(0, (qty * rentPrice) - discount)
      };
    }));
  }, []);

  const getStockIssue = useCallback(() => (
    getCartStockIssues({ cart, products })
  ), [cart, products]);

  return {
    cart,
    clearCart,
    getStockIssue,
    removeCartItem,
    setCart,
    updateCartItem,
    updateCartQty
  };
};
