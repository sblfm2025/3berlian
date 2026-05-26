import { useCallback, useMemo, useState } from 'react';

import { isActiveTransaction } from '../../../utils/transactionStatus';
import { getConditionFee, getDailyFine, getLateDays } from '../utils/returnCalculations';

const RETURNS_PER_PAGE = 12;

export const useReturnWorkflow = ({ transactions, onReturn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [notes, setNotes] = useState('');
  const [itemConditions, setItemConditions] = useState({});
  const [returnQtyByProduct, setReturnQtyByProduct] = useState({});
  const [useDepositForFees, setUseDepositForFees] = useState(true);
  const [returnPage, setReturnPage] = useState(1);
  const [isReturning, setIsReturning] = useState(false);

  const activeTransactions = useMemo(() => (
    transactions.filter(isActiveTransaction)
  ), [transactions]);

  const returnSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueSoonLimit = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const dueTodayCount = activeTransactions.filter(tx => {
      const expected = new Date(tx.expectedReturnDate);
      expected.setHours(0, 0, 0, 0);
      return expected.getTime() === today.getTime();
    }).length;

    const dueSoonCount = activeTransactions.filter(tx => {
      const expected = new Date(tx.expectedReturnDate);
      expected.setHours(0, 0, 0, 0);
      return expected.getTime() > today.getTime() && expected.getTime() <= dueSoonLimit.getTime();
    }).length;

    const overdueCount = activeTransactions.filter(tx => getLateDays(tx) > 0).length;
    const priorityTransactions = [...activeTransactions]
      .map(tx => ({ tx, lateDays: getLateDays(tx) }))
      .sort((a, b) => {
        if (a.lateDays !== b.lateDays) return b.lateDays - a.lateDays;
        return new Date(a.tx.expectedReturnDate) - new Date(b.tx.expectedReturnDate);
      })
      .slice(0, 4);

    return { dueSoonCount, dueTodayCount, overdueCount, priorityTransactions };
  }, [activeTransactions]);

  const filteredTransactions = useMemo(() => (
    activeTransactions.filter(tx => {
      const haystack = `${tx.id} ${tx.customerName || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const lateDays = getLateDays(tx);

      if (!matchesSearch) return false;
      if (filter === 'Terlambat') return lateDays > 0;
      if (filter === 'Tepat Waktu') return lateDays === 0;
      return true;
    })
  ), [activeTransactions, filter, searchTerm]);

  const returnPageCount = Math.max(1, Math.ceil(filteredTransactions.length / RETURNS_PER_PAGE));
  const safeReturnPage = Math.min(returnPage, returnPageCount);
  const paginatedTransactions = filteredTransactions.slice(
    (safeReturnPage - 1) * RETURNS_PER_PAGE,
    safeReturnPage * RETURNS_PER_PAGE
  );
  const returnStartNumber = filteredTransactions.length === 0 ? 0 : ((safeReturnPage - 1) * RETURNS_PER_PAGE) + 1;
  const returnEndNumber = Math.min(safeReturnPage * RETURNS_PER_PAGE, filteredTransactions.length);

  const handleSelect = (trx) => {
    const lateDays = getLateDays(trx);
    const returnableItems = trx.remainingItems?.length ? trx.remainingItems : trx.items;
    const initialConditions = returnableItems.reduce((acc, item) => {
      acc[item.product.id] = 'Baik';
      return acc;
    }, {});
    const initialReturnQty = returnableItems.reduce((acc, item) => {
      acc[item.product.id] = Number(item.qty || 0);
      return acc;
    }, {});

    setItemConditions(initialConditions);
    setReturnQtyByProduct(initialReturnQty);
    setUseDepositForFees(Number(trx.depositAmount ?? trx.deposit ?? 0) > 0);
    setPaymentMethod('Tunai');
    setNotes('');
    setSelectedTrx({
      ...trx,
      items: returnableItems,
      customerName: trx.customerName || 'Pelanggan belum tercatat',
      calculatedLateDays: lateDays,
      calculatedFine: lateDays * getDailyFine(trx),
      conditionFee: 0,
      finalFee: lateDays * getDailyFine(trx)
    });
  };

  const applyConditionToAll = (condition) => {
    if (!selectedTrx) return;

    setItemConditions(selectedTrx.items.reduce((acc, item) => {
      acc[item.product.id] = condition;
      return acc;
    }, {}));
  };

  const conditionBreakdown = selectedTrx
    ? selectedTrx.items.map(item => {
        const returnQty = Math.min(Number(item.qty || 0), Number(returnQtyByProduct[item.product.id] ?? item.qty ?? 0));
        const condition = itemConditions[item.product.id] || 'Baik';
        return {
          ...item,
          condition,
          fee: getConditionFee(condition, item) * returnQty,
          returnQty
        };
      })
    : [];

  const conditionFee = conditionBreakdown.reduce((sum, item) => sum + item.fee, 0);
  const lateFee = selectedTrx?.calculatedFine || 0;
  const totalAdditionalFee = lateFee + conditionFee;
  const depositAmount = Number(selectedTrx?.depositAmount ?? selectedTrx?.deposit ?? 0);
  const depositDeducted = useDepositForFees ? Math.min(depositAmount, totalAdditionalFee) : 0;
  const depositReturned = Math.max(0, depositAmount - depositDeducted);
  const feePaidSeparately = Math.max(0, totalAdditionalFee - depositDeducted);
  const lateItemCount = conditionBreakdown.filter(item => item.condition !== 'Baik').length;
  const selectedReturnItems = conditionBreakdown
    .filter(item => Number(item.returnQty || 0) > 0)
    .map(item => ({ ...item, qty: Number(item.returnQty || 0), returnQty: Number(item.returnQty || 0) }));
  const totalReturnQty = selectedReturnItems.reduce((sum, item) => sum + Number(item.returnQty || 0), 0);
  const totalReturnableQty = conditionBreakdown.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const isFullReturn = totalReturnQty > 0 && totalReturnQty === totalReturnableQty;
  const returnModeLabel = totalReturnQty <= 0
    ? 'Belum ada item'
    : isFullReturn
      ? 'Full return'
      : 'Partial return';

  const resetSelection = () => {
    setSelectedTrx(null);
    setItemConditions({});
    setReturnQtyByProduct({});
    setUseDepositForFees(true);
    setPaymentMethod('Tunai');
    setNotes('');
  };

  const updateReturnQty = (productId, nextQty, maxQty) => {
    setReturnQtyByProduct(prev => ({
      ...prev,
      [productId]: Math.max(0, Math.min(Number(maxQty || 0), Number(nextQty || 0)))
    }));
  };

  const handleConfirm = async () => {
    if (isReturning) return;
    if (!selectedTrx) return;
    if (totalReturnQty <= 0) return;

    setIsReturning(true);
    try {
      await onReturn({
        ...selectedTrx,
        paymentMethod,
        notes,
        itemConditions,
        returnItems: selectedReturnItems,
        conditionFee,
        lateFee,
        totalFee: totalAdditionalFee,
        paymentMethodForFees: paymentMethod,
        useDepositForFees
      });
    } catch {
      return;
    } finally {
      setIsReturning(false);
    }

    setSelectedTrx(null);
    setReturnQtyByProduct({});
    setUseDepositForFees(true);
  };

  const updateFilter = useCallback((nextFilter) => {
    setFilter(nextFilter);
    setReturnPage(1);
  }, []);

  const updateSearchTerm = useCallback((nextSearch) => {
    setSearchTerm(nextSearch);
    setReturnPage(1);
  }, []);

  return {
    RETURNS_PER_PAGE,
    activeTransactions,
    applyConditionToAll,
    conditionBreakdown,
    conditionFee,
    depositAmount,
    depositDeducted,
    depositReturned,
    feePaidSeparately,
    filter,
    filteredTransactions,
    getLateDays,
    handleConfirm,
    handleSelect,
    itemConditions,
    isReturning,
    lateFee,
    lateItemCount,
    notes,
    paginatedTransactions,
    paymentMethod,
    resetSelection,
    returnEndNumber,
    returnModeLabel,
    returnPageCount,
    returnQtyByProduct,
    returnStartNumber,
    safeReturnPage,
    searchTerm,
    selectedTrx,
    setItemConditions,
    setNotes,
    setPaymentMethod,
    setReturnPage,
    setUseDepositForFees,
    totalReturnQty,
    totalReturnableQty,
    totalAdditionalFee,
    useDepositForFees,
    updateReturnQty,
    updateFilter,
    updateSearchTerm,
    ...returnSummary
  };
};
