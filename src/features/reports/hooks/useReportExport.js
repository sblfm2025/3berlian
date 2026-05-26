import { useState } from 'react';

import { formatDate, formatNumberDot } from '../../../utils/format';
import { loadScript } from '../../../utils/browser';

export const useReportExport = ({ getStatusLabel, selectedMonth, sortedTransactions, totalDenda, totalRevenue, totalSewa }) => {
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
          ['Tanggal', 'No. Nota', 'Pelanggan', 'Status', 'Metode Pembayaran', 'Sewa (Rp)', 'Denda (Rp)', 'Total (Rp)']
        ];
        sortedTransactions.forEach(t => {
          wsData.push([
            formatDate(t.rentDate),
            t.id,
            t.customerName,
            getStatusLabel(t.status),
            t.paymentMethod || 'Tunai',
            t.totalAmount || 0,
            t.lateFee || 0,
            (t.totalAmount || 0) + (t.lateFee || 0)
          ]);
        });
        wsData.push([]);
        wsData.push(['', '', '', '', 'TOTAL KESELURUHAN:', totalSewa, totalDenda, totalRevenue]);

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        window.XLSX.writeFile(wb, `Rekening_Koran_${selectedMonth}.xlsx`);
      } catch (err) {
        console.error(err);
        alert('Gagal mengekspor file Excel.');
      } finally {
        setIsExporting('');
      }
    };

    if (!window.XLSX) {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
        .then(exportData)
        .catch(() => {
          setIsExporting('');
          alert('Gagal memuat library Excel');
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

      const tableColumn = ['Tanggal', 'No. Nota', 'Pelanggan', 'Status', 'Metode Pembayaran', 'Sewa (Rp)', 'Denda (Rp)', 'Total (Rp)'];
      const tableRows = [];

      sortedTransactions.forEach(t => {
        const grandTotal = (t.totalAmount || 0) + (t.lateFee || 0);
        tableRows.push([
          formatDate(t.rentDate),
          t.id,
          t.customerName,
          getStatusLabel(t.status),
          t.paymentMethod || 'Tunai',
          formatNumberDot(t.totalAmount || 0),
          formatNumberDot(t.lateFee || 0),
          formatNumberDot(grandTotal)
        ]);
      });

      tableRows.push([
        { content: 'TOTAL KESELURUHAN:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumberDot(totalSewa), styles: { fontStyle: 'bold' } },
        { content: formatNumberDot(totalDenda), styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
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
          7: { halign: 'right' }
        }
      });

      doc.save(`Rekening_Koran_${selectedMonth}.pdf`);
    } catch (error) {
      console.error('PDF Data Render Error:', error);
      alert('Gagal memuat sistem PDF. Pastikan koneksi internet stabil.');
    } finally {
      setIsExporting('');
    }
  };

  return { handleExportExcel, handleExportPDF, isExporting };
};
