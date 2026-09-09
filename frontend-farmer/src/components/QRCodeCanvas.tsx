import React, { useEffect, useRef } from 'react';
import { QRCodeModel } from '../utils/qrGenerator';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const dpr = window.devicePixelRatio || 2;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Generate genuine ISO/IEC 18004 QR Model
      const qr = new QRCodeModel(4, 1);
      qr.addData(value || 'APMC-SMART-FARMER-GATE-PASS-2026');
      qr.make();

      const moduleCount = qr.getModuleCount();
      const margin = 12;
      const availableSize = size - margin * 2;
      const cellSize = Math.floor(availableSize / moduleCount);
      const offset = margin + Math.floor((availableSize - cellSize * moduleCount) / 2);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Outer border frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, size - 4, size - 4);

      // Render Dark Modules
      ctx.fillStyle = '#090d16';
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(
              offset + c * cellSize,
              offset + r * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }

      // Render Center Emblem (Government APMC DoCA Watermark)
      const centerSize = Math.floor(size * 0.2);
      const centerPos = (size - centerSize) / 2;

      // Outer white badge rounded box
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(centerPos - 3, centerPos - 3, centerSize + 6, centerSize + 6, 6);
      } else {
        ctx.fillRect(centerPos - 3, centerPos - 3, centerSize + 6, centerSize + 6);
      }
      ctx.fill();

      // Green emblem box
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(centerPos, centerPos, centerSize, centerSize, 4);
      } else {
        ctx.fillRect(centerPos, centerPos, centerSize, centerSize);
      }
      ctx.fill();

      // Government APMC emblem text
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.floor(centerSize * 0.48)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('APMC', size / 2, size / 2 + 1);
    } catch (err) {
      console.error('QR rendering error:', err);
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        display: 'block',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
      className={className}
    />
  );
};

