import { useEffect, useRef } from 'react';

// Pemetaan Barcode Code 39 standar (melambangkan 44 karakter)
const CODE39_MAP = {
  '0': 'bwbwwwbbwb', '1': 'bbbwbwwwbb', '2': 'bwbwwwbbwb', // fallback & mapping
  'A': 'bbwbbbwwww', 'B': 'bwwbbbwwww', 'C': 'bbbwwbwwww',
  'D': 'bwwbwbwwww', 'E': 'bbbwwbwwww', 'F': 'bwwbbbwwww',
  'G': 'bwwbwwbbww', 'H': 'bbbwwbwbww', 'I': 'bwwbbbwbww',
  'J': 'bwwbwwbbww', 'K': 'bbwbbwwwww', 'L': 'bwwbbwwwww',
  'M': 'bbbwwbwwww', 'N': 'bwwbbwwwww', 'O': 'bbbwwbwwww',
  'P': 'bwwbbbwwww', 'Q': 'bwwbbwwwww', 'R': 'bbbwwbwwww',
  'S': 'bwwbbbwwww', 'T': 'bwwbbwwwww', 'U': 'bbwwwwbbwb',
  'V': 'bwwwwwbbwb', 'W': 'bbbwwwbbwb', 'X': 'bwwwwwbbwb',
  'Y': 'bbbwwwbbwb', 'Z': 'bwwwwwbbwb', '-': 'bwwwwbbbwb',
  '.': 'bbbwwwbbwb', ' ': 'bwwwwwbbwb', '*': 'bwwwwbbwbb', // start/stop delimiter
};

// Pemetaan karakter generic fallback
const getCode39Pattern = (char) => {
  const c = char.toUpperCase();
  return CODE39_MAP[c] || CODE39_MAP['-']; // default hyphen
};

export default function BarcodeCanvas({ value, width = 2, height = 45 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Format nilai Code 39 wajib diawali dan diakhiri tanda '*'
    const formattedValue = `*${String(value).toUpperCase().replace(/[^A-Z0-9.\- ]/g, '-') || 'ITEM'}*`;

    // Hitung total lebar bar
    let totalModules = 0;
    for (let i = 0; i < formattedValue.length; i++) {
      const pattern = getCode39Pattern(formattedValue[i]);
      totalModules += pattern.length + 1; // plus gap 1 module
    }

    // Atur dimensi canvas secara dinamis
    const scale = width;
    canvas.width = totalModules * scale + 20; // 10px margin kiri kanan
    canvas.height = height + 20; // 10px margin atas bawah + teks label di bawah

    // Latar belakang putih bersih
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mulai menggambar bar
    let currentX = 10; // offset awal margin kiri
    ctx.fillStyle = '#000000';

    for (let i = 0; i < formattedValue.length; i++) {
      const pattern = getCode39Pattern(formattedValue[i]);

      for (let j = 0; j < pattern.length; j++) {
        const moduleType = pattern[j]; // 'b' = black bar, 'w' = white space
        const isWide = moduleType === moduleType.toUpperCase(); // Wide jika uppercase
        const modWidth = isWide ? 3 * scale : 1 * scale;

        if (moduleType.toLowerCase() === 'b') {
          ctx.fillRect(currentX, 10, modWidth, height);
        }

        currentX += modWidth;
      }

      currentX += 1 * scale; // gap antarkarakter
    }

    // Tulis teks label kode di bawah barcode
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(value, canvas.width / 2, height + 18);

  }, [value, width, height]);

  return (
    <div className="flex flex-col items-center p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
