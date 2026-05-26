import { useCallback, useMemo, useState } from 'react';

import { getConditionFee, getDailyFine, getLateDays } from '../utils/returnCalculations';

const RETURNS_PER_PAGE = 12;

export const useReturnWorkflow = ({ transactions, onReturn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [notes, setNotes] = useState('');
  const [itemConditions, setItemConditions] = useState({});
  const [returnPage, setReturnPage] = useState(1);
  const [isReturning, setIsReturning] = useState(false);

  const activeTransactions = useMemo(() => (
    transactions.filter(tx => tx.status === 'disewa')
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
    const initialConditions = trx.items.reduce((acc, item) => {
      acc[item.product.id] = 'Baik';
      return acc;
    }, {});

    setItemConditions(initialConditions);
    setPaymentMethod('Tunai');
    setNotes('');
    setSelectedTrx({
      ...trx,
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
    ? selectedTrx.items.map(item => ({
        ...item,
        condition: itemConditions[item.product.id] || 'Baik',
        fee: getConditionFee(itemConditions[item.product.id] || 'Baik', item)
      }))
    : [];

  const conditionFee = conditionBreakdown.reduce((sum, item) => sum + item.fee, 0);
  const lateFee = selectedTrx?.calculatedFine || 0;
  const totalAdditionalFee = lateFee + conditionFee;
  const lateItemCount = conditionBreakdown.filter(item => item.condition !== 'Baik').length;

  const resetSelection = () => {
    setSelectedTrx(null);
    setItemConditions({});
    setPaymentMethod('Tunai');
    setNotes('');
  };

  const handleConfirm = async () => {
    if (isReturning) return;
    if (!selectedTrx) return;

    setIsReturning(true);
    try {
      await onReturn({
        ...selectedTrx,
        paymentMethod,
        notes,
        itemConditions,
        conditionFee,
        lateFee,
        totalFee: totalAdditionalFee,
        paymentMethodForFees: paymentMethod
      });
    } catch {
      return;
    } finally {
      setIsReturning(false);
    }

    setSelectedTrx(null);
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
    returnPageCount,
    returnStartNumber,
    safeReturnPage,
    searchTerm,
    selectedTrx,
    setItemConditions,
    setNotes,
    setPaymentMethod,
    setReturnPage,
    totalAdditionalFee,
    updateFilter,
    updateSearchTerm,
    ...returnSummary
  };
};
