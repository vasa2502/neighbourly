import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Renders a QR code as a canvas element using the qrcode library.
 * Used for community invitation links, referral links, etc.
 */
export function QRCode({ value, size = 200, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#1a3d2a",
        light: "#ffffff",
      },
    }).catch(() => {
      // Silent fail if value is invalid
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Generates a QR code data URL (for saving/downloading).
 */
export async function generateQRDataUrl(value: string, size = 300): Promise<string> {
  return QRCodeLib.toDataURL(value, {
    width: size,
    margin: 2,
    color: {
      dark: "#1a3d2a",
      light: "#ffffff",
    },
  });
}
