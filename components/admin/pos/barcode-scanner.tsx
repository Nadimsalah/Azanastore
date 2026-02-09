"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { X, Sparkles, Barcode, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const { t } = useLanguage()
    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0
            },
            false
        )

        scannerRef.current.render(
            (decodedText) => {
                if (!isPaused) {
                    onScan(decodedText)
                    setLastScanned(decodedText)
                    setIsPaused(true)
                    // Vibration feedback if supported
                    if (navigator.vibrate) navigator.vibrate(200)
                }
            },
            (error) => {
                // Ignore errors
            }
        )

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
            }
        }
    }, [onScan, isPaused])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
                {/* Scanner Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Barcode className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest leading-none mb-1">
                                {t("admin.pos.scanner")}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Continuous Mode Active</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Scanner Stage */}
                    <div className="relative aspect-square md:aspect-video bg-black rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner group">
                        <div id="reader" className="w-full h-full" />

                        {/* Overlay when paused */}
                        <AnimatePresence>
                            {isPaused && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center text-white z-20 p-6 text-center"
                                >
                                    <CheckCircle2 className="w-20 h-20 mb-6 animate-bounce" />
                                    <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Item Added!</h3>
                                    <p className="font-mono text-white/60 mb-8 px-4 opacity-80 break-all">{lastScanned}</p>

                                    <Button
                                        onClick={() => setIsPaused(false)}
                                        className="bg-white text-primary hover:bg-white/90 h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                    >
                                        Scan Next Product
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scanner Decoration */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary/40 rounded-tl-[2rem] m-6 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary/40 rounded-tr-[2rem] m-6 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary/40 rounded-bl-[2rem] m-6 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary/40 rounded-br-[2rem] m-6 pointer-events-none" />
                    </div>

                    {/* Quick Tips */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-start gap-4">
                            <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                Ensure the barcode is within the <span className="text-gray-900">center box</span> for faster detection.
                            </p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-start gap-4">
                            <Barcode className="w-5 h-5 text-primary shrink-0 mt-1" />
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                Scanning automatically pauses to <span className="text-gray-900">prevent duplicates</span>.
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-gray-100 font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900" onClick={onClose}>
                        Finish Scanning
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
