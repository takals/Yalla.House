'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Download, QrCode, X } from 'lucide-react'
import { QRCodeSVG, generateQRDataURL } from './qr-code'

interface ShareCardProps {
  listingTitle: string
  address: string
  price: string | null
  photoUrl: string | null
  shareUrl: string
  shortUrl: string
  locale: string
}

export function ShareCardModal({
  listingTitle,
  address,
  price,
  photoUrl,
  shareUrl,
  shortUrl,
  locale,
}: ShareCardProps) {
  const t = useTranslations('listingPage')
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Card dimensions (1200x630 — OG image format)
      const W = 1200
      const H = 630
      canvas.width = W
      canvas.height = H

      // Background
      ctx.fillStyle = '#0F1117'
      ctx.fillRect(0, 0, W, H)

      // Photo area (left 60%)
      if (photoUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject()
            img.src = photoUrl
          })
          // Draw photo filling left portion
          const photoW = W * 0.58
          const scale = Math.max(photoW / img.width, H / img.height)
          const drawW = img.width * scale
          const drawH = img.height * scale
          const offsetX = (photoW - drawW) / 2
          const offsetY = (H - drawH) / 2
          ctx.save()
          ctx.beginPath()
          ctx.rect(0, 0, photoW, H)
          ctx.clip()
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
          // Gradient overlay on photo
          const gradient = ctx.createLinearGradient(photoW * 0.6, 0, photoW, 0)
          gradient.addColorStop(0, 'rgba(15,17,23,0)')
          gradient.addColorStop(1, 'rgba(15,17,23,1)')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, photoW, H)
          ctx.restore()
        } catch {
          // Photo failed to load — continue without it
        }
      }

      // Right panel content area
      const rightX = W * 0.6
      const rightW = W * 0.4
      const centerX = rightX + rightW / 2

      // QR code
      const qrDataUrl = await generateQRDataURL(shortUrl, 200, '#FFFFFF', 'transparent')
      const qrImg = new Image()
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve()
        qrImg.onerror = () => resolve()
        qrImg.src = qrDataUrl
      })
      const qrSize = 180
      const qrY = 40
      ctx.drawImage(qrImg, centerX - qrSize / 2, qrY, qrSize, qrSize)

      // "Scan to view" text
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '500 14px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(t('shareCardScanToView'), centerX, qrY + qrSize + 24)

      // Price
      if (price) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(price, centerX, qrY + qrSize + 80)
      }

      // Title
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.textAlign = 'center'
      const titleY = price ? qrY + qrSize + 120 : qrY + qrSize + 80
      // Wrap title text
      const words = listingTitle.split(' ')
      var line = ''
      var lineY = titleY
      for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + ' '
        var metrics = ctx.measureText(testLine)
        if (metrics.width > rightW - 40 && i > 0) {
          ctx.fillText(line.trim(), centerX, lineY)
          line = words[i] + ' '
          lineY += 28
        } else {
          line = testLine
        }
      }
      ctx.fillText(line.trim(), centerX, lineY)

      // Address
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '400 16px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.fillText(address, centerX, lineY + 30)

      // Yalla.House brand bar at bottom
      const barH = 48
      ctx.fillStyle = '#D4764E'
      ctx.fillRect(0, H - barH, W, barH)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Yalla.House', 24, H - barH + 30)
      ctx.font = '400 14px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(shortUrl.replace('https://', ''), W - 24, H - barH + 30)

      // Download
      const link = document.createElement('a')
      link.download = `yalla-house-${listingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }, [photoUrl, shortUrl, listingTitle, address, price, t])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
      >
        <QrCode size={14} />
        {t('shareCardButton')}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#1C1F2E] rounded-2xl shadow-2xl border border-white/10 max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{t('shareCardTitle')}</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Preview card */}
            <div className="bg-[#0F1117] rounded-xl overflow-hidden mb-4">
              <div className="flex">
                {/* Photo preview */}
                <div className="w-3/5 h-48 relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={listingTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F1117]" />
                </div>
                {/* QR + info */}
                <div className="w-2/5 flex flex-col items-center justify-center p-4 gap-2">
                  <QRCodeSVG value={shortUrl} size={100} fgColor="#FFFFFF" bgColor="transparent" />
                  <p className="text-white/50 text-[10px]">{t('shareCardScanToView')}</p>
                  {price && <p className="text-white font-bold text-lg">{price}</p>}
                  <p className="text-white/60 text-xs text-center">{address}</p>
                </div>
              </div>
              {/* Brand bar */}
              <div className="bg-brand px-3 py-1.5 flex items-center justify-between">
                <span className="text-white font-bold text-sm">Yalla.House</span>
                <span className="text-white/80 text-xs">{shortUrl.replace('https://', '')}</span>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? t('shareCardDownloading') : t('shareCardDownload')}
            </button>

            {/* QR code standalone download */}
            <div className="mt-3 flex items-center justify-center gap-4">
              <div className="bg-white rounded-lg p-3">
                <QRCodeSVG value={shortUrl} size={120} />
              </div>
              <div className="text-sm text-white/60">
                <p className="font-semibold text-white mb-1">{t('shareCardQROnly')}</p>
                <p className="text-xs">{t('shareCardQRDescription')}</p>
                <button
                  onClick={async () => {
                    var url = await generateQRDataURL(shortUrl, 600)
                    var a = document.createElement('a')
                    a.download = 'yalla-house-qr.png'
                    a.href = url
                    a.click()
                  }}
                  className="mt-2 text-brand hover:text-[#BF6840] text-xs font-semibold transition-colors"
                >
                  {t('shareCardDownloadQR')} &darr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
