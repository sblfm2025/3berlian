import { useState } from 'react';

import { formatDate, formatNumberDot } from '../../../utils/format';
import { loadScript } from '../../../utils/browser';

const isVoidTransaction = (transaction) => transaction.status === 'void';

const getDepositAmount = (transaction) => Number(transaction.depositAmount ?? transaction.deposit ?? 0);

const getDepositReturned = (transaction) => Number(transaction.depositReturned || transaction.returnInfo?.depositReturned || 0);

const getDepositDeducted = (transaction) => Number(transaction.depositDeducted || transaction.returnInfo?.depositDeducted || 0);

export const useReportExport = ({
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

  const handleExportExcel = () => {
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
        window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
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
  };

  const handleExportPDF = async () => {
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
  };

  return { handleExportExcel, handleExportPDF, isExporting };
};
