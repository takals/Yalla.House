'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  fgColor?: string
  bgColor?: string
  className?: string
}

export function QRCodeSVG({ value, size = 200, fgColor = '#0F1117', bgColor = '#FFFFFF', className }: QRCodeProps) {
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'M',
    }).then(svgStr => {
      setSvg(svgStr)
    }).catch(() => {
      setSvg('')
    })
  }, [value, size, fgColor, bgColor])

  if (!svg) return null

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/**
 * Generate a QR code as a data URL (PNG) for use in share cards / downloads.
 */
export async function generateQRDataURL(
  value: string,
  size = 300,
  fgColor = '#0F1117',
  bgColor = '#FFFFFF',
): Promise<string> {
  return QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel: 'M',
  })
}
