import { useCallback, useMemo, useState } from 'react';

import { formatMonthInput } from '../../../utils/format';

const REPORTS_PER_PAGE = 20;

const getLateDays = (trx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(trx.expectedReturnDate);
  expected.setHours(0, 0, 0, 0);
  return today > expected ? Math.ceil((today - expected) / (1000 * 60 * 60 * 24)) : 0;
};

export const useReportData = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(formatMonthInput());
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportPage, setReportPage] = useState(1);

  const reportData = useMemo(() => {
    const monthlyTrx = transactions.filter(t => (t.rentDate || '').startsWith(selectedMonth));
    const filteredTransactions = monthlyTrx
      .filter(t => statusFilter === 'Semua' || t.status === statusFilter)
      .filter(t => paymentMethodFilter === 'Semua' || (t.paymentMethod || 'Tunai') === paymentMethodFilter)
      .filter(t => {
        if (!searchTerm.trim()) return true;
        const haystack = `${t.id || ''} ${t.customerName || ''} ${t.customerPhone || ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      });
    const sortedTransactions = filteredTransactions.slice().sort((a, b) => (b.rentDate || '').localeCompare(a.rentDate || ''));
    const totalSewa = sortedTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalDenda = sortedTransactions.reduce((sum, t) => sum + (t.lateFee || 0), 0);
    const totalRevenue = totalSewa + totalDenda;

    const paymentMix = sortedTransactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'Tunai';
      const amount = (t.totalAmount || 0) + (t.lateFee || 0);

      if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
      acc[method].count += 1;
      acc[method].revenue += amount;
      return acc;
    }, {});

    const paymentMixList = Object.entries(paymentMix)
      .sort((a, b) => b[1].revenue - a[1].revenue);

    const topProducts = sortedTransactions.reduce((acc, trx) => {
      (trx.items || []).forEach(item => {
        const key = item.product?.name || 'Produk tidak dikenal';
        acc[key] = (acc[key] || 0) + (item.qty || 0);
      });
      return acc;
    }, {});

    const topProductList = Object.entries(topProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCustomers = sortedTransactions.reduce((acc, trx) => {
      const key = trx.customerName || 'Pelanggan belum tercatat';
      const revenue = (trx.totalAmount || 0) + (trx.lateFee || 0);
      acc[key] = (acc[key] || 0) + revenue;
      return acc;
    }, {});

    const topCustomerList = Object.entries(topCustomers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const overdueTransactions = sortedTransactions.filter(t => t.status === 'disewa' && getLateDays(t) > 0);
    const completedCount = sortedTransactions.filter(t => t.status === 'selesai').length;
    const activeCount = sortedTransactions.filter(t => t.status === 'disewa').length;
    const customerCount = new Set(sortedTransactions.map(t => t.customerName || 'Pelanggan belum tercatat')).size;
    const lateTransactions = sortedTransactions.filter(t => (t.lateFee || 0) > 0);
    const averageLateFee = lateTransactions.length
      ? sortedTransactions.reduce((sum, t) => sum + (t.lateFee || 0), 0) / lateTransactions.length
      : 0;
    const lateFeeRatio = totalRevenue ? (totalDenda / totalRevenue) * 100 : 0;
    const overdueCount = overdueTransactions.length;
    const topPaymentMethod = paymentMixList[0]?.[0] || 'Tunai';

    return {
      activeCount,
      averageLateFee,
      completedCount,
      customerCount,
      hasTransactions: sortedTransactions.length > 0,
      lateFeeRatio,
      overdueCount,
      overdueTransactions,
      paymentMix,
      paymentMixList,
      sortedTransactions,
      topCustomerList,
      topPaymentMethod,
      topProductList,
      totalDenda,
      totalRevenue,
      totalSewa
    };
  }, [paymentMethodFilter, searchTerm, selectedMonth, statusFilter, transactions]);

  const reportPageCount = Math.max(1, Math.ceil(reportData.sortedTransactions.length / REPORTS_PER_PAGE));
  const safeReportPage = Math.min(reportPage, reportPageCount);
  const paginatedTransactions = reportData.sortedTransactions.slice(
    (safeReportPage - 1) * REPORTS_PER_PAGE,
    safeReportPage * REPORTS_PER_PAGE
  );
  const reportStartNumber = reportData.sortedTransactions.length === 0 ? 0 : ((safeReportPage - 1) * REPORTS_PER_PAGE) + 1;
  const reportEndNumber = Math.min(safeReportPage * REPORTS_PER_PAGE, reportData.sortedTransactions.length);

  const resetFilters = useCallback(() => {
    setSelectedMonth(formatMonthInput());
    setStatusFilter('Semua');
    setPaymentMethodFilter('Semua');
    setSearchTerm('');
    setReportPage(1);
  }, []);

  const updateSelectedMonth = useCallback((nextMonth) => {
    setSelectedMonth(nextMonth);
    setReportPage(1);
  }, []);

  const updateStatusFilter = useCallback((nextStatus) => {
    setStatusFilter(nextStatus);
    setReportPage(1);
  }, []);

  const updatePaymentMethodFilter = useCallback((nextMethod) => {
    setPaymentMethodFilter(nextMethod);
    setReportPage(1);
  }, []);

  const updateSearchTerm = useCallback((nextSearch) => {
    setSearchTerm(nextSearch);
    setReportPage(1);
  }, []);

  return {
    REPORTS_PER_PAGE,
    getLateDays,
    paginatedTransactions,
    paymentMethodFilter,
    reportEndNumber,
    reportPageCount,
    reportStartNumber,
    resetFilters,
    safeReportPage,
    searchTerm,
    selectedMonth,
    setReportPage,
    statusFilter,
    updatePaymentMethodFilter,
    updateSearchTerm,
    updateSelectedMonth,
    updateStatusFilter,
    ...reportData
  };
};
