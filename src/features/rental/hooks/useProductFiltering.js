import { useCallback, useMemo, useState } from 'react';

const PRODUCTS_PER_PAGE = 20;

export const useProductFiltering = ({ products, transactions, cart }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [productPage, setProductPage] = useState(1);

  const categories = useMemo(() => {
    return ['Semua', ...new Set(products.map(product => product.category).filter(Boolean))];
  }, [products]);

  const availableProducts = useMemo(() => products.filter(product => {
    const productText = [
      product.name,
      product.sku,
      product.category,
      product.size,
      product.color
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = productText.includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return product.stock > 0 && matchesSearch && matchesCategory;
  }), [products, search, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return categories.filter(category => category !== 'Semua').map(category => ({
      category,
      count: products.filter(product => product.category === category && product.stock > 0).length
    }));
  }, [categories, products]);

  const sortedProducts = useMemo(() => {
    return [...availableProducts].sort((a, b) => {
      const aSelected = cart.some(item => item.product.id === a.id);
      const bSelected = cart.some(item => item.product.id === b.id);
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      if (a.stock !== b.stock) return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });
  }, [availableProducts, cart]);

  const productPageCount = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  const safeProductPage = Math.min(productPage, productPageCount);
  const paginatedProducts = sortedProducts.slice(
    (safeProductPage - 1) * PRODUCTS_PER_PAGE,
    safeProductPage * PRODUCTS_PER_PAGE
  );
  const productStartNumber = sortedProducts.length === 0 ? 0 : ((safeProductPage - 1) * PRODUCTS_PER_PAGE) + 1;
  const productEndNumber = Math.min(safeProductPage * PRODUCTS_PER_PAGE, sortedProducts.length);

  const favoriteProducts = useMemo(() => {
    const demand = transactions.reduce((acc, trx) => {
      (trx.items || []).forEach(item => {
        const productId = item.product?.id || item.product?.name;
        if (!productId) return;
        acc[productId] = (acc[productId] || 0) + (item.qty || 0);
      });
      return acc;
    }, {});

    return products
      .filter(product => product.stock > 0)
      .sort((a, b) => {
        const aDemand = demand[a.id] || 0;
        const bDemand = demand[b.id] || 0;
        if (aDemand !== bDemand) return bDemand - aDemand;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);
  }, [products, transactions]);

  const selectCategory = useCallback((category) => {
    setSelectedCategory(category);
    setProductPage(1);
  }, []);

  const updateSearch = useCallback((value) => {
    setSearch(value);
    setProductPage(1);
  }, []);

  return {
    availableProducts,
    categories,
    categoryCounts,
    favoriteProducts,
    paginatedProducts,
    productEndNumber,
    productPage,
    productPageCount,
    productStartNumber,
    safeProductPage,
    search,
    selectedCategory,
    selectCategory,
    setProductPage,
    sortedProducts,
    updateSearch
  };
};

export { PRODUCTS_PER_PAGE };
