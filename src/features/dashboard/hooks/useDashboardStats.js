import { useMemo } from 'react';

import { formatDateInput } from '../../../utils/format';
import { isActiveTransaction, isCompletedTransaction } from '../../../utils/transactionStatus';

const isRevenueTransaction = (transaction) => transaction.status !== 'void';

export const useDashboardStats = ({ transactions, products }) => {
  return useMemo(() => {
    const today = formatDateInput();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const revenueTransactions = transactions.filter(isRevenueTransaction);
    const todayTransactions = revenueTransactions.filter(t => t.rentDate === today);
    const completedToday = revenueTransactions.filter(t => isCompletedTransaction(t) && t.rentDate === today);
    const activeRentals = transactions.filter(isActiveTransaction);
    const overdueRentals = activeRentals.filter(t => t.expectedReturnDate <= today);
    const upcomingReturns = activeRentals.filter(t => t.expectedReturnDate > today && t.expectedReturnDate <= formatDateInput(nextWeek));
    const totalIncomeToday = todayTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + (t.totalAmount || 0) + (t.lateFee || 0), 0);
    const averageTicket = revenueTransactions.length ? Math.round(totalRevenue / revenueTransactions.length) : 0;
    const lowStockProducts = products.filter(p => p.isActive !== false && p.status !== 'inactive' && (p.stock || 0) <= 2);
    const lowStockCount = lowStockProducts.length;
    const pendingReturnCount = overdueRentals.length + upcomingReturns.length;
    const todayRevenueShare = totalRevenue ? Math.round((totalIncomeToday / totalRevenue) * 100) : 0;

    const recentTransactions = [...transactions]
      .sort((a, b) => (b.rentDate || '').localeCompare(a.rentDate || ''))
      .slice(0, 5);

    const paymentMix = revenueTransactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'Tunai';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentRevenueMix = revenueTransactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'Tunai';
      const revenue = (t.totalAmount || 0) + (t.lateFee || 0);
      acc[method] = (acc[method] || 0) + revenue;
      return acc;
    }, {});

    const productDemand = revenueTransactions.reduce((acc, trx) => {
      (trx.items || []).forEach(item => {
        const key = item.product?.name || 'Produk tidak dikenal';
        acc[key] = (acc[key] || 0) + (item.qty || 0);
      });
      return acc;
    }, {});

    const topProducts = Object.entries(productDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const customerCount = new Set(revenueTransactions.map(tx => tx.customerName).filter(Boolean)).size;
    const activeItemsCount = activeRentals.reduce((sum, trx) => {
      return sum + (trx.items || []).reduce((qtySum, item) => qtySum + (item.qty || 0), 0);
    }, 0);

    const bestPaymentMethod = Object.entries(paymentRevenueMix)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Tunai';

    const priorityReturns = [...overdueRentals, ...upcomingReturns]
      .sort((a, b) => (a.expectedReturnDate || '').localeCompare(b.expectedReturnDate || ''))
      .slice(0, 5);

    const trend = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const label = day.toLocaleDateString('id-ID', { weekday: 'short' });
      const key = formatDateInput(day);
      const total = revenueTransactions
        .filter(t => t.rentDate === key)
        .reduce((sum, t) => sum + (t.totalAmount || 0) + (t.lateFee || 0), 0);

      return { label, total };
    });

    return {
      activeItemsCount,
      activeRentals,
      averageTicket,
      bestPaymentMethod,
      completedToday,
      customerCount,
      lowStockCount,
      lowStockProducts,
      overdueRentals,
      paymentMix,
      paymentRevenueMix,
      pendingReturnCount,
      priorityReturns,
      recentTransactions,
      today,
      todayRevenueShare,
      todayTransactions,
      topProducts,
      totalIncomeToday,
      totalRevenue,
      trend,
      upcomingReturns
    };
  }, [products, transactions]);
};
