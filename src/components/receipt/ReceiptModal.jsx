import { useState } from 'react';
import { Cloud, X, Printer, Download, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatNumberDot } from '../../utils/format';
import { loadScript } from '../../utils/browser';

// ==========================================
export default function ReceiptModal({ receiptData, onClose }) {
  const [isExporting, setIsExporting] = useState('');
  const [printerWidth, setPrinterWidth] = useState('80mm');

  if (!receiptData) return null;

  const is58 = printerWidth === '58mm';

  // Deteksi apakah struk pengembalian (Return Receipt)
  const isReturnReceipt =
    receiptData.status === 'COMPLETED' ||
    receiptData.status === 'RETURNED_PARTIAL' ||
    receiptData.status === 'returned' ||
    receiptData.status === 'partially_returned' ||
    !!receiptData.returnInfo ||
    (Array.isArray(receiptData.returnHistory) && receiptData.returnHistory.length > 0);

  // Ambil info return terakhir
  const returnInfo = receiptData.returnInfo ||
    (Array.isArray(receiptData.returnHistory) && receiptData.returnHistory.length > 0
      ? receiptData.returnHistory[receiptData.returnHistory.length - 1]
      : null);

  const handlePrint = () => {
    let printContent = `
      <div class="text-center mb-4 border-b border-black pb-4 border-dashed">
        <h2 class="font-bold text-[18px] mb-1">3 BERLIAN</h2>
        <p class="text-[11px] font-semibold">SANGGAR SENI & RENTAL BAJU ADAT</p>
        <p class="text-[10px] mt-1">BTN Tiga Berlian, Watang Sawitto<br/>Kabupaten Pinrang</p>
        <p class="text-[10px] mt-1">Telp: 0813-4353-1375</p>
      </div>
    `;

    if (isReturnReceipt && returnInfo) {
      // PRINT CONTENT UNTUK STRUK RETURN
      printContent += `
        <div class="text-center mb-3">
          <p class="font-bold text-[12px] uppercase">TANDA TERIMA PENGEMBALIAN</p>
        </div>
        <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
          <div class="flex justify-between mb-1"><span class="text-gray-600">No. Nota Sewa:</span><span class="font-bold">${receiptData.id}</span></div>
          <div class="flex justify-between mb-1"><span class="text-gray-600">Tanggal Kembali:</span><span>${formatDate(returnInfo.returnedAt || new Date().toISOString())}</span></div>
          <div class="flex justify-between items-start mb-1"><span class="text-gray-600">Pelanggan:</span><span class="font-bold uppercase text-right w-2/3">${receiptData.customerName || receiptData.customer?.name}</span></div>
          ${receiptData.customerPhone ? `<div class="flex justify-between mb-1"><span class="text-gray-600">No. WA:</span><span>${receiptData.customerPhone}</span></div>` : ''}
        </div>
        <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
          <p class="font-bold mb-2">Item Dikembalikan:</p>
      `;

      const itemsToPrint = returnInfo.items || receiptData.items;
      itemsToPrint.forEach(item => {
        const condLabel = item.condition === 'good' ? 'Baik'
          : item.condition === 'laundry' ? 'Kotor/Laundry'
          : item.condition === 'damaged' ? 'Rusak'
          : item.condition === 'lost' ? 'Hilang' : 'Baik';
        printContent += `
          <div class="mb-2">
            <div class="font-semibold leading-snug break-words">${item.productName || item.product?.name || 'Produk'}</div>
            <div class="flex justify-between mt-1 text-gray-700">
              <span>Qty: ${item.qty || item.returnQty} unit</span>
              <span class="font-bold text-gray-900">(${condLabel})</span>
            </div>
          </div>
        `;
      });

      printContent += `</div><div class="border-b border-black border-dashed mb-4 pb-3 space-y-1">`;
      printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Denda Terlambat:</span><span>${formatCurrency(returnInfo.lateFee || 0)}</span></div>`;
      printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Biaya Kondisi:</span><span>${formatCurrency(returnInfo.conditionFee || 0)}</span></div>`;
      printContent += `<div class="flex justify-between font-bold text-[12px] pt-1 mt-1 border-t border-black"><span>Total Biaya Tambahan:</span><span>${formatCurrency(returnInfo.totalFee || 0)}</span></div>`;

      if (returnInfo.depositAmount > 0) {
        printContent += `
          <div class="flex justify-between text-[11px] text-gray-600 pt-1"><span>Deposit Awal:</span><span>${formatCurrency(returnInfo.depositAmount)}</span></div>
          <div class="flex justify-between text-[11px] text-red-600"><span>Deposit Dipotong:</span><span>-${formatCurrency(returnInfo.depositDeducted || 0)}</span></div>
          <div class="flex justify-between text-[11px] text-emerald-700 font-bold"><span>Deposit Dikembalikan:</span><span>${formatCurrency(returnInfo.depositReturned || 0)}</span></div>
        `;
      }

      if (returnInfo.feePaidSeparately > 0) {
        printContent += `
          <div class="flex justify-between font-bold text-[12px] pt-2 text-red-700">
            <span>Bayar Tunai/Transfer:</span><span>${formatCurrency(returnInfo.feePaidSeparately)}</span>
          </div>
        `;
      }

      printContent += `</div>`;
      printContent += `
        <div class="text-center text-[11px]">
          ${returnInfo.notes ? `<p class="text-left bg-gray-50 border border-gray-200 rounded p-2 mb-3 text-[10px]">Catatan: ${returnInfo.notes}</p>` : ''}
          <p class="font-bold text-[12px] mt-2">*** PROSES KEMBALI SUKSES ***</p>
        </div>
      `;
    } else {
      // PRINT CONTENT UNTUK NOTA SEWA BIASA (SEPERTI SEBELUMNYA)
      printContent += `
        <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
          <div class="flex justify-between mb-1"><span class="text-gray-600">No. Nota:</span><span class="font-bold">${receiptData.id}</span></div>
          <div class="flex justify-between mb-1"><span class="text-gray-600">Tanggal:</span><span>${formatDate(receiptData.rentDate)}</span></div>
          <div class="flex justify-between items-start mb-1"><span class="text-gray-600">Pelanggan:</span><span class="font-bold uppercase text-right w-2/3">${receiptData.customerName || receiptData.customer?.name}</span></div>
          ${receiptData.customerPhone ? `<div class="flex justify-between mb-1"><span class="text-gray-600">No. WA:</span><span>${receiptData.customerPhone}</span></div>` : ''}
          ${receiptData.customerAddress ? `<div class="flex justify-between items-start gap-3 mb-1"><span class="text-gray-600">Alamat:</span><span class="text-right w-2/3 break-words">${receiptData.customerAddress}</span></div>` : ''}
          ${receiptData.customerNote ? `<div class="flex justify-between items-start mb-1"><span class="text-gray-600">Catatan:</span><span class="text-right w-2/3">${receiptData.customerNote}</span></div>` : ''}
          ${receiptData.depositAmount > 0 ? `<div class="flex justify-between mb-1"><span class="text-gray-600">Deposit:</span><span class="font-bold">${formatCurrency(receiptData.depositAmount)}</span></div>` : ''}
        </div>
        <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
          <p class="font-bold mb-2">Item Disewa:</p>
      `;

      receiptData.items.forEach(item => {
        printContent += `
          <div class="mb-2">
            <div class="font-semibold leading-snug break-words">${item.product.name}</div>
            <div class="flex justify-between mt-1 text-gray-700">
              <span>${item.qty} x ${formatCurrency(item.product.rentPrice).replace('Rp', '')}</span>
              <span class="font-bold">${formatCurrency(item.qty * item.product.rentPrice).replace('Rp', '')}</span>
            </div>
          </div>
        `;
      });

      printContent += `</div><div class="border-b border-black border-dashed mb-4 pb-3 space-y-1">`;
      printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Subtotal:</span><span>${formatCurrency(receiptData.subTotal || receiptData.totalAmount)}</span></div>`;

      if (receiptData.discountAmount > 0) {
        printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Diskon:</span><span>-${formatCurrency(receiptData.discountAmount)}</span></div>`;
      }

      printContent += `
        <div class="flex justify-between font-bold text-[14px] mt-2 pt-2 border-t border-black">
          <span>TOTAL:</span><span>${formatCurrency(receiptData.totalAmount)}</span>
        </div>
      </div>`;

      printContent += `<div class="border-b border-black border-dashed mb-4 pb-3 space-y-1 text-[11px]">`;
      printContent += `<div class="flex justify-between text-gray-600"><span>Metode:</span><span class="font-bold">${receiptData.paymentMethod || 'Tunai'}</span></div>`;

      if (receiptData.paymentMethod === 'Tunai') {
         printContent += `<div class="flex justify-between text-gray-600"><span>Bayar:</span><span>${formatCurrency(receiptData.cashReceived || receiptData.totalAmount)}</span></div>`;
         printContent += `<div class="flex justify-between text-gray-600"><span>Kembali:</span><span>${formatCurrency(receiptData.change || 0)}</span></div>`;
      }
      printContent += `</div>`;

      printContent += `
        <div class="text-center text-[11px]">
          <p class="text-gray-600">Batas Pengembalian:</p>
          <p class="font-bold text-[13px] border border-black inline-block px-2 py-1 mt-1 mb-3">${formatDate(receiptData.expectedReturnDate)}</p>
          <p class="text-[9px] text-gray-500 italic mb-2">Catatan: Keterlambatan pengembalian<br/>akan dikenakan denda per hari.</p>
          <p class="font-bold text-[12px] mt-3">*** TERIMA KASIH ***</p>
        </div>
      `;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Cetak Nota - 3 Berlian</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 0; }
            body { font-family: monospace; color: black; background: white; width: ${printerWidth}; padding: ${is58 ? '4px' : '10px'}; margin: 0 auto; font-size: ${is58 ? '9px' : '11px'}; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>setTimeout(function() { window.print(); }, 800);</script>
        </body>
      </html>
    `);
    iframe.contentWindow.document.close();
    setTimeout(() => { if(document.body.contains(iframe)) document.body.removeChild(iframe); }, 15000);
  };

  const handleDownloadPDF = async () => {
    setIsExporting('pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const widthNum = is58 ? 58 : 80;
      let pdfHeight = 115 + (receiptData.items.length * 12);

      if (isReturnReceipt && returnInfo) {
        pdfHeight = 110 + ((returnInfo.items?.length || receiptData.items.length) * 12);
        if (returnInfo.depositAmount > 0) pdfHeight += 12;
        if (returnInfo.feePaidSeparately > 0) pdfHeight += 8;
      } else {
        if (receiptData.customerPhone) pdfHeight += 4;
        if (receiptData.customerAddress) pdfHeight += 8;
        if (receiptData.discountAmount > 0) pdfHeight += 8;
        if (receiptData.paymentMethod === 'Tunai') pdfHeight += 8;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [widthNum, Math.max(150, pdfHeight)] });

      let y = 10;
      const left = is58 ? 3 : 5;
      const right = is58 ? 55 : 75;
      const center = is58 ? 29 : 40;

      doc.setFontSize(is58 ? 12 : 14); doc.setFont("helvetica", "bold"); doc.text("3 BERLIAN", center, y, { align: "center" }); y += 4;
      doc.setFontSize(is58 ? 6.5 : 8); doc.setFont("helvetica", "normal"); doc.text("SANGGAR SENI & RENTAL BAJU ADAT", center, y, { align: "center" }); y += 4;
      doc.setFontSize(is58 ? 6 : 7); doc.text("BTN Tiga Berlian, Watang Sawitto", center, y, { align: "center" }); y += 3;
      doc.text("Kabupaten Pinrang - Telp: 0813-4353-1375", center, y, { align: "center" }); y += 5;

      const drawDashedLine = (yPos) => {
        doc.setLineDashPattern([1, 1], 0); doc.line(left, yPos, right, yPos); doc.setLineDashPattern([], 0);
      };

      drawDashedLine(y); y += 4;

      if (isReturnReceipt && returnInfo) {
        // PDF UNTUK RETURN RECEIPT
        doc.setFont("helvetica", "bold"); doc.text("TANDA TERIMA PENGEMBALIAN", center, y, { align: "center" }); y += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`No. Nota  : ${receiptData.id}`, left, y); y += 4;
        doc.text(`Tgl Kembali: ${formatDate(returnInfo.returnedAt || new Date().toISOString())}`, left, y); y += 4;
        doc.text(`Pelanggan : ${receiptData.customerName || receiptData.customer?.name}`, left, y); y += 4;
        if(receiptData.customerPhone) { doc.text(`No. WA    : ${receiptData.customerPhone}`, left, y); y += 4; }

        drawDashedLine(y); y += 4;
        doc.setFont("helvetica", "bold"); doc.text("Item Dikembalikan:", left, y); y += 4; doc.setFont("helvetica", "normal");

        const itemsToPrint = returnInfo.items || receiptData.items;
        itemsToPrint.forEach(item => {
          const splitName = doc.splitTextToSize(item.productName || item.product?.name || 'Produk', right - left);
          doc.text(splitName, left, y); y += (splitName.length * 3) + 1;
          const condLabel = item.condition === 'good' ? 'Baik'
            : item.condition === 'laundry' ? 'Kotor/Laundry'
            : item.condition === 'damaged' ? 'Rusak'
            : item.condition === 'lost' ? 'Hilang' : 'Baik';
          doc.text(`Qty: ${item.qty || item.returnQty} unit`, left + 2, y); doc.text(`(${condLabel})`, right, y, { align: "right" }); y += 4;
        });

        drawDashedLine(y); y += 4;

        doc.text("Denda Terlambat:", left, y); doc.text(formatCurrency(returnInfo.lateFee || 0), right, y, { align: "right" }); y += 4;
        doc.text("Biaya Kondisi:", left, y); doc.text(formatCurrency(returnInfo.conditionFee || 0), right, y, { align: "right" }); y += 4;
        doc.setFont("helvetica", "bold");
        doc.text("Total Tambahan:", left, y); doc.text(formatCurrency(returnInfo.totalFee || 0), right, y, { align: "right" }); y += 4;
        doc.setFont("helvetica", "normal");

        if (returnInfo.depositAmount > 0) {
          y += 1;
          doc.text("Deposit Awal:", left, y); doc.text(formatCurrency(returnInfo.depositAmount), right, y, { align: "right" }); y += 4;
          doc.text("Deposit Dipotong:", left, y); doc.text(`-${formatCurrency(returnInfo.depositDeducted || 0)}`, right, y, { align: "right" }); y += 4;
          doc.setFont("helvetica", "bold");
          doc.text("Deposit Kembali:", left, y); doc.text(formatCurrency(returnInfo.depositReturned || 0), right, y, { align: "right" }); y += 4;
          doc.setFont("helvetica", "normal");
        }

        if (returnInfo.feePaidSeparately > 0) {
          y += 1;
          doc.setFont("helvetica", "bold");
          doc.text("Bayar Cash/TF:", left, y); doc.text(formatCurrency(returnInfo.feePaidSeparately), right, y, { align: "right" }); y += 4;
          doc.setFont("helvetica", "normal");
        }

        drawDashedLine(y); y += 4;
        if (returnInfo.notes) {
          const splitNotes = doc.splitTextToSize(`Catatan: ${returnInfo.notes}`, right - left);
          doc.text(splitNotes, left, y); y += (splitNotes.length * 3) + 2;
        }

        doc.setFont("helvetica", "bold"); doc.setFontSize(is58 ? 7 : 8);
        doc.text("*** PROSES KEMBALI SUKSES ***", center, y, { align: "center" });
      } else {
        // PDF UNTUK NOTA SEWA BIASA (SEPERTI SEBELUMNYA)
        doc.text(`No. Nota : ${receiptData.id}`, left, y); y += 4;
        doc.text(`Tanggal  : ${formatDate(receiptData.rentDate)}`, left, y); y += 4;
        doc.text(`Pelanggan: ${receiptData.customerName || receiptData.customer?.name}`, left, y); y += 4;
        if(receiptData.customerPhone) { doc.text(`No. WA   : ${receiptData.customerPhone}`, left, y); y += 4; }
        if(receiptData.customerAddress) {
          const splitAlamat = doc.splitTextToSize(`Alamat   : ${receiptData.customerAddress}`, right - left);
          doc.text(splitAlamat, left, y); y += (splitAlamat.length * 3) + 1;
        }
        if(receiptData.customerNote) {
          const splitCatatan = doc.splitTextToSize(`Catatan  : ${receiptData.customerNote}`, right - left);
          doc.text(splitCatatan, left, y); y += (splitCatatan.length * 3) + 1;
        }
        if(receiptData.depositAmount > 0) { doc.text(`Deposit  : ${formatCurrency(receiptData.depositAmount)}`, left, y); y += 4; }

        drawDashedLine(y); y += 4;
        doc.setFont("helvetica", "bold"); doc.text("Item Disewa:", left, y); y += 4; doc.setFont("helvetica", "normal");

        receiptData.items.forEach(item => {
            const splitName = doc.splitTextToSize(item.product.name, right - left);
            doc.text(splitName, left, y); y += (splitName.length * 3) + 1;
            const qtyPrice = `${item.qty} x ${formatNumberDot(item.product.rentPrice)}`;
            const total = formatNumberDot(item.qty * item.product.rentPrice);
            doc.text(qtyPrice, left + 2, y); doc.text(total, right, y, { align: "right" }); y += 4;
        });

        drawDashedLine(y); y += 4;

        doc.text("Subtotal:", left, y); doc.text(formatCurrency(receiptData.subTotal || receiptData.totalAmount), right, y, { align: "right" }); y += 4;

        if (receiptData.discountAmount > 0) {
          doc.text("Diskon:", left, y); doc.text(`-${formatCurrency(receiptData.discountAmount)}`, right, y, { align: "right" }); y += 4;
        }

        doc.setFont("helvetica", "bold"); doc.setFontSize(is58 ? 8 : 9);
        doc.text("TOTAL:", left, y); doc.text(formatCurrency(receiptData.totalAmount), right, y, { align: "right" }); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(is58 ? 6 : 7);

        drawDashedLine(y); y += 4;

        doc.text(`Metode: ${receiptData.paymentMethod || 'Tunai'}`, left, y); y += 4;
        if (receiptData.paymentMethod === 'Tunai') {
           doc.text("Bayar:", left, y); doc.text(formatCurrency(receiptData.cashReceived || receiptData.totalAmount), right, y, { align: "right" }); y += 4;
           doc.text("Kembali:", left, y); doc.text(formatCurrency(receiptData.change || 0), right, y, { align: "right" }); y += 4;
        }

        drawDashedLine(y); y += 4;

        doc.text("Batas Pengembalian:", center, y, { align: "center" }); y += 4;
        doc.setFont("helvetica", "bold"); doc.setFontSize(is58 ? 8 : 9);
        const returnDateText = formatDate(receiptData.expectedReturnDate);
        const textWidth = doc.getTextWidth(returnDateText);
        doc.rect(center - (textWidth/2) - 2, y - 3.5, textWidth + 4, 5);
        doc.text(returnDateText, center, y, { align: "center" }); y += 6;

        doc.setFont("helvetica", "italic"); doc.setFontSize(is58 ? 5.5 : 6);
        doc.text("Catatan: Keterlambatan pengembalian", center, y, { align: "center" }); y += 3;
        doc.text("akan dikenakan denda per hari.", center, y, { align: "center" }); y += 5;

        doc.setFont("helvetica", "bold"); doc.setFontSize(is58 ? 7 : 8);
        doc.text("*** TERIMA KASIH ***", center, y, { align: "center" });
      }

      doc.save(`Nota-${receiptData.id}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting('');
    }
  };

  const handleSendWA = () => {
    let phoneNo = receiptData.customerPhone || '';
    if (phoneNo.startsWith('0')) { phoneNo = '62' + phoneNo.substring(1); }
    const phoneQuery = phoneNo ? `phone=${phoneNo}&` : '';
    let text = '';

    if (isReturnReceipt && returnInfo) {
      // WA UNTUK NOTA PENGEMBALIAN KOSTUM
      text = `*TANDA TERIMA PENGEMBALIAN - SANGGAR SENI 3 BERLIAN*\n------------------------------------------\n`;
      text += `ID Nota Sewa: ${receiptData.id}\nTanggal Kembali: ${formatDate(returnInfo.returnedAt || new Date().toISOString())}\nPelanggan: ${receiptData.customerName || receiptData.customer?.name}\n`;
      text += `\n*Item Dikembalikan:*\n`;
      const itemsToPrint = returnInfo.items || receiptData.items;
      itemsToPrint.forEach(item => {
        const condLabel = item.condition === 'good' ? 'Baik'
          : item.condition === 'laundry' ? 'Kotor/Laundry'
          : item.condition === 'damaged' ? 'Rusak'
          : item.condition === 'lost' ? 'Hilang' : 'Baik';
        text += `- ${item.qty || item.returnQty}x ${item.productName || item.product?.name || 'Produk'} (${condLabel})\n`;
      });

      text += `\n*Rincian Biaya Tambahan:*\n`;
      text += `- Denda Terlambat: ${formatCurrency(returnInfo.lateFee || 0)}\n`;
      text += `- Biaya Kondisi: ${formatCurrency(returnInfo.conditionFee || 0)}\n`;
      text += `*Total Denda/Kerusakan: ${formatCurrency(returnInfo.totalFee || 0)}*\n`;

      if (returnInfo.depositAmount > 0) {
        text += `\n*Uang Jaminan/Deposit:*\n`;
        text += `- Deposit Awal: ${formatCurrency(returnInfo.depositAmount)}\n`;
        text += `- Potong Biaya: -${formatCurrency(returnInfo.depositDeducted || 0)}\n`;
        text += `*Sisa Deposit Dikembalikan: ${formatCurrency(returnInfo.depositReturned || 0)}*\n`;
      }

      if (returnInfo.feePaidSeparately > 0) {
        text += `*Kekurangan Biaya Dibayar: ${formatCurrency(returnInfo.feePaidSeparately)}*\n`;
      }

      text += `------------------------------------------\n`;
      if (returnInfo.notes) text += `Catatan: ${returnInfo.notes}\n`;
      text += `Kostum Anda telah kami terima dengan baik. Terima kasih!`;
    } else {
      // WA UNTUK NOTA SEWA BIASA
      text = `*NOTA PENYEWAAN - SANGGAR SENI 3 BERLIAN*\n------------------------------------------\n`;
      text += `ID Nota: ${receiptData.id}\nTanggal: ${formatDate(receiptData.rentDate)}\nPelanggan: ${receiptData.customerName || receiptData.customer?.name}\n`;
      if (receiptData.customerAddress) text += `Alamat: ${receiptData.customerAddress}\n`;
      text += `\n*Daftar Item:*\n`;
      receiptData.items.forEach(item => { text += `- ${item.qty}x ${item.product.name}\n  (${formatCurrency(item.product.rentPrice)} / item)\n`; });

      if (receiptData.discountAmount > 0) text += `\n*Diskon: -${formatCurrency(receiptData.discountAmount)}*`;

      text += `\n*Total Tagihan: ${formatCurrency(receiptData.totalAmount)}*\n------------------------------------------\n`;
      text += `Harap dikembalikan sebelum: ${formatDate(receiptData.expectedReturnDate)}\n(Denda keterlambatan berlaku)\nTerima kasih!`;
    }
    window.open(`https://api.whatsapp.com/send?${phoneQuery}text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="p-4 bg-blue-900 flex justify-between items-center border-b border-blue-800 text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Printer size={18}/> {isReturnReceipt ? 'Tanda Terima Return' : 'Nota Transaksi'}
          </h3>
          <button onClick={onClose} className="text-blue-100 hover:text-white bg-blue-800 shadow-sm p-1.5 rounded-full transition-colors active:scale-95"><X size={18}/></button>
        </div>

        {/* Selektor Printer Termal */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Ukuran Printer Termal:</span>
          <div className="flex gap-1.5">
            {['58mm', '80mm'].map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setPrinterWidth(size)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${printerWidth === size ? 'bg-blue-700 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Tampilan Visual (Preview) Nota UI Saja */}
        <div className="overflow-y-auto p-6 bg-gray-200 flex justify-center w-full shadow-inner">
          <div className={`bg-white p-6 w-full shadow-sm text-black font-mono leading-tight transition-all duration-300 ${is58 ? 'max-w-[240px] text-[9px]' : 'max-w-[320px] text-[11px]'}`}>
            <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
              <h2 className="font-bold text-[18px] mb-1">3 BERLIAN</h2>
              <p className="text-[11px] font-semibold">SANGGAR SENI & RENTAL BAJU ADAT</p>
              <p className="text-[10px] mt-1">BTN Tiga Berlian, Watang Sawitto<br/>Kabupaten Pinrang</p>
              <p className="text-[10px] mt-1">Telp: 0813-4353-1375</p>
            </div>

            {isReturnReceipt && returnInfo ? (
              // PREVIEW UI RETURN RECEIPT
              <>
                <div className="text-center mb-3">
                  <p className="font-bold text-[11px] uppercase tracking-wide">TANDA TERIMA PENGEMBALIAN</p>
                </div>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">No. Nota Sewa:</span><span className="font-bold">{receiptData.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Tgl Kembali:</span><span>{formatDate(returnInfo.returnedAt || new Date().toISOString())}</span></div>
                  <div className="flex justify-between items-start gap-3"><span className="text-gray-600">Pelanggan:</span><span className="w-2/3 break-words text-right font-bold uppercase">{receiptData.customerName || receiptData.customer?.name}</span></div>
                  {receiptData.customerPhone && <div className="flex justify-between"><span className="text-gray-600">No. WA:</span><span>{receiptData.customerPhone}</span></div>}
                </div>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
                  <p className="font-bold mb-2">Item Dikembalikan:</p>
                  {(returnInfo.items || receiptData.items).map((item, idx) => {
                    const condLabel = item.condition === 'good' ? 'Baik'
                      : item.condition === 'laundry' ? 'Kotor/Laundry'
                      : item.condition === 'damaged' ? 'Rusak'
                      : item.condition === 'lost' ? 'Hilang' : 'Baik';
                    return (
                      <div key={idx} className="mb-2">
                        <div className="break-words font-semibold leading-snug">{item.productName || item.product?.name || 'Produk'}</div>
                        <div className="flex justify-between mt-1 text-gray-700">
                          <span>Qty: {item.qty || item.returnQty} unit</span>
                          <span className="font-bold text-gray-900">({condLabel})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-600"><span>Denda Terlambat:</span><span>{formatCurrency(returnInfo.lateFee || 0)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Biaya Kondisi:</span><span>{formatCurrency(returnInfo.conditionFee || 0)}</span></div>
                  <div className="flex justify-between font-bold text-[12px] pt-1 mt-1 border-t border-gray-200">
                    <span>Total Tambahan:</span><span>{formatCurrency(returnInfo.totalFee || 0)}</span>
                  </div>
                  {returnInfo.depositAmount > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-gray-600"><span>Deposit Awal:</span><span>{formatCurrency(returnInfo.depositAmount)}</span></div>
                      <div className="flex justify-between text-red-600"><span>Deposit Dipotong:</span><span>-{formatCurrency(returnInfo.depositDeducted || 0)}</span></div>
                      <div className="flex justify-between text-emerald-700 font-bold"><span>Deposit Kembali:</span><span>{formatCurrency(returnInfo.depositReturned || 0)}</span></div>
                    </div>
                  )}
                  {returnInfo.feePaidSeparately > 0 && (
                    <div className="flex justify-between font-black text-[12px] pt-2 border-t border-gray-200 text-red-700">
                      <span>Bayar Tunai/TF:</span><span>{formatCurrency(returnInfo.feePaidSeparately)}</span>
                    </div>
                  )}
                </div>
                <div className="text-center text-[11px]">
                  {returnInfo.notes && <p className="text-left bg-slate-50 border border-slate-200 rounded p-2 mb-3 text-[10px]">Catatan: {returnInfo.notes}</p>}
                  <p className="font-bold text-[12px] mt-2">*** PROSES KEMBALI SUKSES ***</p>
                </div>
              </>
            ) : (
              // PREVIEW UI NOTA SEWA BIASA (SEPERTI SEBELUMNYA)
              <>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">No. Nota:</span><span className="font-bold">{receiptData.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Tanggal:</span><span>{formatDate(receiptData.rentDate)}</span></div>
                  <div className="flex justify-between items-start gap-3"><span className="text-gray-600">Pelanggan:</span><span className="w-2/3 break-words text-right font-bold uppercase">{receiptData.customerName || receiptData.customer?.name}</span></div>
                  {receiptData.customerPhone && <div className="flex justify-between"><span className="text-gray-600">No. WA:</span><span>{receiptData.customerPhone}</span></div>}
                  {receiptData.customerAddress && <div className="flex justify-between items-start gap-3"><span className="text-gray-600">Alamat:</span><span className="w-2/3 break-words text-right">{receiptData.customerAddress}</span></div>}
                  {receiptData.customerNote && <div className="flex justify-between items-start gap-3"><span className="text-gray-600">Catatan:</span><span className="w-2/3 break-words text-right">{receiptData.customerNote}</span></div>}
                  {receiptData.depositAmount > 0 && <div className="flex justify-between"><span className="text-gray-600">Deposit:</span><span className="font-bold">{formatCurrency(receiptData.depositAmount)}</span></div>}
                </div>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
                  <p className="font-bold mb-2">Item Disewa:</p>
                  {receiptData.items.map((item, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="break-words font-semibold leading-snug">{item.product.name}</div>
                      <div className="flex justify-between mt-1 text-gray-700">
                        <span>{item.qty} x {formatCurrency(item.product.rentPrice).replace('Rp', '')}</span>
                        <span className="font-bold">{formatCurrency(item.qty * item.product.rentPrice).replace('Rp', '')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>{formatCurrency(receiptData.subTotal || receiptData.totalAmount)}</span></div>
                  {receiptData.discountAmount > 0 && <div className="flex justify-between text-green-700 font-bold"><span>Diskon:</span><span>-{formatCurrency(receiptData.discountAmount)}</span></div>}
                  <div className="flex justify-between font-black text-[14px] pt-2 mt-2 border-t border-gray-200">
                    <span>TOTAL:</span><span>{formatCurrency(receiptData.totalAmount)}</span>
                  </div>
                </div>
                <div className="border-b border-black border-dashed mb-4 pb-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-600"><span>Metode:</span><span className="font-bold text-gray-800">{receiptData.paymentMethod || 'Tunai'}</span></div>
                  {receiptData.paymentMethod === 'Tunai' && (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Bayar:</span><span>{formatCurrency(receiptData.cashReceived || receiptData.totalAmount)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Kembali:</span><span className="font-bold">{formatCurrency(receiptData.change || 0)}</span></div>
                    </>
                  )}
                </div>
                <div className="text-center text-[11px]">
                  <p className="text-gray-600">Batas Pengembalian:</p>
                  <p className="font-bold text-[13px] border border-black inline-block px-2 py-1 mt-1 mb-3">{formatDate(receiptData.expectedReturnDate)}</p>
                  <p className="text-[9px] text-gray-500 italic mb-2">Catatan: Keterlambatan pengembalian<br/>akan dikenakan denda per hari.</p>
                  <p className="font-bold text-[12px] mt-3">*** TERIMA KASIH ***</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border-t flex flex-wrap gap-2.5 justify-center">
           <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-blue-800 text-white text-sm font-bold rounded-2xl hover:bg-blue-900 transition-transform active:scale-95 shadow-md"><Printer size={16}/> Cetak</button>
           <button onClick={handleDownloadPDF} disabled={isExporting !== ''} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-slate-800 disabled:bg-gray-400 text-white text-sm font-bold rounded-2xl hover:bg-slate-900 transition-transform active:scale-95 shadow-md">
              {isExporting === 'pdf' ? <Cloud size={16} className="animate-pulse" /> : <Download size={16}/>} PDF
           </button>
           <button onClick={handleSendWA} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 text-white text-sm font-bold rounded-2xl hover:bg-emerald-700 transition-transform active:scale-95 shadow-md w-full"><MessageCircle size={18}/> Kirim ke WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
