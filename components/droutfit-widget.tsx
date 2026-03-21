"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { useEffect } from "react"

interface DrOutfitWidgetProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  productImage: string
  merchantId: string
}

export function DrOutfitWidget({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  merchantId
}: DrOutfitWidgetProps) {
  
  // Clean up the image URL (ensure absolute path)
  const localHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const fullImagePath = productImage.startsWith('http') ? productImage : `${localHost}${productImage}`
  
  // Construct the secure VTO URL (using localhost for strict origin matching)
  const widgetBaseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3005' 
    : 'https://droutfit.com'
    
  // Use all possible param aliases to ensure compatibility
  const vtoUrl = `${widgetBaseUrl}/widget/${productId}?merchant_id=${merchantId}&m=${merchantId}&name=${encodeURIComponent(productName)}&image=${encodeURIComponent(fullImagePath)}&img=${encodeURIComponent(fullImagePath)}`

  if (process.env.NODE_ENV === 'development') {
    console.log("[DrOutfit] Launching Widget with URL:", vtoUrl);
  }

  // Handle "Close" messages from inside the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'droutfit-close') {
        onClose()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          {/* Overlay Click to Close */}
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[480px] h-full max-h-[90vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100/50 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VTO Engine Iframe - Using key to force clean reload with params */}
            <iframe
              key={vtoUrl}
              src={vtoUrl}
              title="DrOutfit Virtual Try-On"
              className="w-full h-full border-none bg-[#F8F9FB]"
              allow="camera; microphone"
              onLoad={() => console.log("[DrOutfit] Iframe Loaded Successfully")}
            />

            {/* Powered By Branding */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Powered by Droutfit.com</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
