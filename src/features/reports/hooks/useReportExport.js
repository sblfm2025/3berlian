import { useCallback, useState } from 'react';

import { formatDate, formatNumberDot } from '../../../utils/format';
import { loadScript } from '../../../utils/browser';

const isVoidTransaction = (transaction) => transaction.status === 'void';

const getDepositAmount = (transaction) => Number(transaction.depositAmount ?? transaction.deposit ?? 0);

const getDepositReturned = (transaction) => Number(transaction.depositReturned || transaction.returnInfo?.depositReturned || 0);

const getDepositDeducted = (transaction) => Number(transaction.depositDeducted || transaction.returnInfo?.depositDeducted || 0);

// Label tipe jurnal keuangan yang lebih mudah dibaca
const getLedgerTypeLabel = (type) => {
  const labels = {
    RENTAL_PAYMENT: 'Uang Sewa',
    DEPOSIT_IN: 'Deposit Masuk',
    DEPOSIT_REFUND: 'Deposit Refund',
    DEPOSIT_DEDUCTION: 'Deposit Dipotong',
    LATE_FEE: 'Denda Terlambat',
    DAMAGE_FEE: 'Biaya Kerusakan',
    LOST_FEE: 'Biaya Kehilangan',
    DISCOUNT: 'Potongan Diskon',
    MANUAL_ADJUSTMENT: 'Penyesuaian Manual'
  };
  return labels[type] || type;
};

export const useReportExport = ({
  filteredLedgerRecords = [],
  getStatusLabel,
  onNotify,
  selectedMonth,
  sortedTransactions,
  totalDenda,
  totalDepositDeducted = 0,
  totalDepositHeld = 0,
  totalDepositReturned = 0,
  totalRevenue,
  totalSewa
}) => {
  const [isExporting, setIsExporting] = useState('');

  // ─────────────────────────────────────────────────────
  // 📊 EXPORT LAPORAN SEWA → EXCEL
  // ─────────────────────────────────────────────────────
  const handleExportExcel = useCallback(() => {
    setIsExporting('excel');
    const exportData = () => {
      try {
        const wsData = [
          ['SANGGAR SENI 3 BERLIAN'],
          ['Laporan Transaksi (Rekening Koran)'],
          [`Periode: ${selectedMonth}`],
          [],
          ['Tanggal', 'No. Nota', 'Pelanggan', 'Status', 'Metode Pembayaran', 'Sewa (Rp)', 'Denda (Rp)', 'Deposit (Rp)', 'Deposit Kembali (Rp)', 'Deposit Dipotong (Rp)', 'Total Omzet (Rp)']
        ];
        sortedTransactions.forEach(t => {
          const isVoid = isVoidTransaction(t);
          const rentRevenue = isVoid ? 0 : t.totalAmount || 0;
          const fineRevenue = isVoid ? 0 : t.lateFee || 0;
          const remainingQty = t.status === 'partially_returned' && t.remainingItems?.length
            ? t.remainingItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)
            : 0;
          const statusText = getStatusLabel(t.status) + (remainingQty > 0 ? ` (Sisa ${remainingQty} item)` : '');

          wsData.push([
            formatDate(t.rentDate),
            t.id,
            t.customerName,
            statusText,
            t.paymentMethod || 'Tunai',
            rentRevenue,
            fineRevenue,
            isVoid ? 0 : getDepositAmount(t),
            isVoid ? 0 : getDepositReturned(t),
            isVoid ? 0 : getDepositDeducted(t),
            rentRevenue + fineRevenue
          ]);
        });
        wsData.push([]);
        wsData.push(['', '', '', '', 'TOTAL KESELURUHAN:', totalSewa, totalDenda, totalDepositHeld, totalDepositReturned, totalDepositDeducted, totalRevenue]);

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 18 }];
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan Sewa');
        window.XLSX.writeFile(wb, `Rekening_Koran_${selectedMonth}.xlsx`);
      } catch (err) {
        console.error(err);
        onNotify?.({ title: 'Export gagal', message: 'Gagal mengekspor file Excel.', type: 'error' });
      } finally {
        setIsExporting('');
      }
    };

    if (!window.XLSX) {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
        .then(exportData)
        .catch(() => {
          setIsExporting('');
          onNotify?.({ title: 'Export gagal', message: 'Gagal memuat library Excel.', type: 'error' });
        });
    } else {
      exportData();
    }
  }, [getStatusLabel, onNotify, selectedMonth, sortedTransactions, totalDenda, totalDepositDeducted, totalDepositHeld, totalDepositReturned, totalRevenue, totalSewa]);

  // ─────────────────────────────────────────────────────
  // 📊 EXPORT LAPORAN SEWA → PDF
  // ─────────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    setIsExporting('pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SANGGAR SENI 3 BERLIAN', 148, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Transaksi (Rekening Koran)', 148, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Periode: ${selectedMonth}`, 148, 28, { align: 'center' });

      const tableColumn = ['Tanggal', 'No. Nota', 'Pelanggan', 'Status', 'Metode Pembayaran', 'Sewa', 'Denda', 'Deposit', 'Kembali', 'Dipotong', 'Omzet'];
      const tableRows = [];

      sortedTransactions.forEach(t => {
        const isVoid = isVoidTransaction(t);
        const rentRevenue = isVoid ? 0 : t.totalAmount || 0;
        const fineRevenue = isVoid ? 0 : t.lateFee || 0;
        const grandTotal = rentRevenue + fineRevenue;
        const remainingQty = t.status === 'partially_returned' && t.remainingItems?.length
          ? t.remainingItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)
          : 0;
        const statusText = getStatusLabel(t.status) + (remainingQty > 0 ? ` (Sisa ${remainingQty} item)` : '');

        tableRows.push([
          formatDate(t.rentDate),
          t.id,
          t.customerName,
          statusText,
          t.paymentMethod || 'Tunai',
          formatNumberDot(rentRevenue),
          formatNumberDot(fineRevenue),
          formatNumberDot(isVoid ? 0 : getDepositAmount(t)),
          formatNumberDot(isVoid ? 0 : getDepositReturned(t)),
          formatNumberDot(isVoid ? 0 : getDepositDeducted(t)),
          formatNumberDot(grandTotal)
        ]);
      });

      tableRows.push([
        { content: 'TOTAL KESELURUHAN:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumberDot(totalSewa), styles: { fontStyle: 'bold' } },
        { content: formatNumberDot(totalDenda), styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
        { content: formatNumberDot(totalDepositHeld), styles: { fontStyle: 'bold' } },
        { content: formatNumberDot(totalDepositReturned), styles: { fontStyle: 'bold' } },
        { content: formatNumberDot(totalDepositDeducted), styles: { fontStyle: 'bold' } },
        { content: formatNumberDot(totalRevenue), styles: { fontStyle: 'bold' } }
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'right' },
          9: { halign: 'right' },
          10: { halign: 'right' }
        }
      });

      doc.save(`Rekening_Koran_${selectedMonth}.pdf`);
    } catch (error) {
      console.error('PDF Data Render Error:', error);
      onNotify?.({ title: 'Export gagal', message: 'Gagal memuat sistem PDF. Pastikan koneksi internet stabil.', type: 'error' });
    } finally {
      setIsExporting('');
    }
  }, [getStatusLabel, onNotify, selectedMonth, sortedTransactions, totalDenda, totalDepositDeducted, totalDepositHeld, totalDepositReturned, totalRevenue, totalSewa]);

  // ─────────────────────────────────────────────────────
  // 📒 EXPORT BUKU BESAR (LEDGER) → EXCEL
  // ─────────────────────────────────────────────────────
  const handleExportLedgerExcel = useCallback(() => {
    if (!filteredLedgerRecords.length) {
      onNotify?.({ title: 'Tidak ada data', message: 'Tidak ada entri buku besar untuk diekspor.', type: 'warning' });
      return;
    }
    setIsExporting('ledger-excel');
    const exportData = () => {
      try {
        const wsData = [
          ['SANGGAR SENI 3 BERLIAN'],
          ['Buku Besar Keuangan (Jurnal Kas)'],
          [`Diekspor pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`],
          [`Total entri ditampilkan: ${filteredLedgerRecords.length}`],
          [],
          ['Tanggal', 'ID Jurnal', 'Nota Sewa', 'Tipe Mutasi', 'Metode', 'Arah', 'Kategori', 'Keterangan', 'Nominal (Rp)']
        ];

        let totalIN = 0;
        let totalOUT = 0;

        filteredLedgerRecords.forEach(r => {
          const amount = Number(r.amount || 0);
          const isIN = r.direction === 'IN';
          if (isIN) totalIN += amount;
          else totalOUT += amount;

          wsData.push([
            r.createdAt ? formatDate(r.createdAt) : '-',
            r.id || '-',
            r.transactionId || '-',
            getLedgerTypeLabel(r.type),
            r.method || 'Tunai',
            r.direction || '-',
            r.category || 'rental',
            r.notes || '-',
            isIN ? amount : -amount
          ]);
        });

        wsData.push([]);
        wsData.push(['', '', '', '', '', '', '', 'TOTAL KAS MASUK (IN):', totalIN]);
        wsData.push(['', '', '', '', '', '', '', 'TOTAL KAS KELUAR (OUT):', totalOUT]);
        wsData.push(['', '', '', '', '', '', '', 'SALDO BERSIH:', totalIN - totalOUT]);

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
          { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 22 },
          { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 35 }, { wch: 18 }
        ];
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Buku Besar');
        const today = new Date().toISOString().split('T')[0];
        window.XLSX.writeFile(wb, `Buku_Besar_${today}.xlsx`);
        onNotify?.({ title: 'Export berhasil', message: `Buku besar (${filteredLedgerRecords.length} entri) berhasil diunduh.`, type: 'success' });
      } catch (err) {
        console.error(err);
        onNotify?.({ title: 'Export gagal', message: 'Gagal mengekspor buku besar ke Excel.', type: 'error' });
      } finally {
        setIsExporting('');
      }
    };

    if (!window.XLSX) {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
        .then(exportData)
        .catch(() => {
          setIsExporting('');
          onNotify?.({ title: 'Export gagal', message: 'Gagal memuat library Excel.', type: 'error' });
        });
    } else {
      exportData();
    }
  }, [filteredLedgerRecords, onNotify]);

  // ─────────────────────────────────────────────────────
  // 📒 EXPORT BUKU BESAR (LEDGER) → PDF
  // ─────────────────────────────────────────────────────
  const handleExportLedgerPDF = useCallback(async () => {
    if (!filteredLedgerRecords.length) {
      onNotify?.({ title: 'Tidak ada data', message: 'Tidak ada entri buku besar untuk diekspor.', type: 'warning' });
      return;
    }
    setIsExporting('ledger-pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SANGGAR SENI 3 BERLIAN', 148, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Buku Besar Keuangan (Jurnal Kas)', 148, 22, { align: 'center' });
      doc.setFontSize(9);
      const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Dicetak: ${today} | Total: ${filteredLedgerRecords.length} entri`, 148, 28, { align: 'center' });

      const tableColumn = ['Tanggal', 'ID Jurnal', 'Nota Sewa', 'Tipe Mutasi', 'Metode', 'Arah', 'Keterangan', 'Nominal'];
      const tableRows = [];

      let totalIN = 0;
      let totalOUT = 0;

      filteredLedgerRecords.forEach(r => {
        const amount = Number(r.amount || 0);
        const isIN = r.direction === 'IN';
        if (isIN) totalIN += amount;
        else totalOUT += amount;

        tableRows.push([
          r.createdAt ? formatDate(r.createdAt) : '-',
          { content: r.id || '-', styles: { fontSize: 7 } },
          r.transactionId || '-',
          getLedgerTypeLabel(r.type),
          r.method || 'Tunai',
          { content: r.direction || '-', styles: { textColor: isIN ? [5, 150, 105] : [220, 38, 38], fontStyle: 'bold' } },
          { content: r.notes || '-', styles: { fontSize: 8 } },
          { content: (isIN ? '' : '-') + formatNumberDot(amount), styles: { halign: 'right', textColor: isIN ? [5, 150, 105] : [220, 38, 38] } }
        ]);
      });

      tableRows.push([
        { content: `Total IN: ${formatNumberDot(totalIN)}  |  Total OUT: ${formatNumberDot(totalOUT)}  |  Saldo Bersih: ${formatNumberDot(totalIN - totalOUT)}`, colSpan: 8, styles: { halign: 'right', fontStyle: 'bold', fillColor: [241, 245, 249] } }
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          7: { halign: 'right', minCellWidth: 22 }
        }
      });

      const todayISO = new Date().toISOString().split('T')[0];
      doc.save(`Buku_Besar_${todayISO}.pdf`);
      onNotify?.({ title: 'Export berhasil', message: `Buku besar (${filteredLedgerRecords.length} entri) berhasil diunduh.`, type: 'success' });
    } catch (error) {
      console.error('Ledger PDF Error:', error);
      onNotify?.({ title: 'Export gagal', message: 'Gagal memuat sistem PDF. Pastikan koneksi internet stabil.', type: 'error' });
    } finally {
      setIsExporting('');
    }
  }, [filteredLedgerRecords, onNotify]);

  return { handleExportExcel, handleExportPDF, handleExportLedgerExcel, handleExportLedgerPDF, isExporting };
};
