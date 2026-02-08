"use client"

import { useEffect, useRef, useState } from "react"
import { X, Camera, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

// CDN URL for html5-qrcode
const HTML5_QRCODE_CDN = "https://unpkg.com/html5-qrcode"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [libLoaded, setLibLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastScanned, setLastScanned] = useState<string>("")
    const [lastScanTime, setLastScanTime] = useState<number>(0)
    const [showSuccess, setShowSuccess] = useState(false)

    // ... Load library effect (unchanged)
    useEffect(() => {
        if ((window as any).Html5Qrcode) {
            setLibLoaded(true)
            return
        }

        const script = document.createElement("script")
        script.src = HTML5_QRCODE_CDN
        script.async = true
        script.onload = () => setLibLoaded(true)
        script.onerror = () => setError("Failed to load scanner library from CDN.")
        document.body.appendChild(script)
    }, [])

    useEffect(() => {
        if (libLoaded) {
            startScanner()
        }
        return () => {
            stopScanner()
        }
    }, [libLoaded])

    const startScanner = async () => {
        try {
            const Html5Qrcode = (window as any).Html5Qrcode
            if (!Html5Qrcode) {
                throw new Error("Scanner library not found.")
            }

            const scanner = new Html5Qrcode("barcode-reader")
            scannerRef.current = scanner

            const config = {
                fps: 20,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0,
            }

            const onScanSuccess = (decodedText: string) => {
                const now = Date.now()
                // Cooldown: 2 seconds for the SAME barcode to prevent duplicates
                // Different barcodes can be scanned instantly
                if (decodedText !== lastScanned || now - lastScanTime > 2000) {
                    setLastScanned(decodedText)
                    setLastScanTime(now)
                    onScan(decodedText)

                    // Visual feedback
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 500)
                }
            }

            try {
                await scanner.start({ facingMode: "environment" }, config, onScanSuccess, () => { })
            } catch (envError) {
                try {
                    await scanner.start({ facingMode: "user" }, config, onScanSuccess, () => { })
                } catch (userError) {
                    await scanner.start({}, config, onScanSuccess, () => { })
                }
            }

            setIsScanning(true)
            setError(null)
        } catch (err: any) {
            console.error("Scanner failed:", err)
            setError(err.message || "Could not access any camera.")
            setIsScanning(false)
        }
    }

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop()
                scannerRef.current.clear()
            } catch (err) {
                console.error("Error stopping scanner:", err)
            }
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
                >
                    {/* Success Flash Effect */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-primary/20 pointer-events-none z-10"
                            />
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10">
                                <Camera className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Batch Scan</h2>
                                <p className="text-sm text-white/50 font-medium whitespace-nowrap">Scan multiple items smoothly</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                stopScanner()
                                onClose()
                            }}
                            className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span>Done</span>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Scanner View */}
                    <div className="relative aspect-square md:aspect-video rounded-[2rem] overflow-hidden bg-white/5 border-2 border-primary/20 shadow-inner">
                        {!libLoaded && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Initializing...</p>
                            </div>
                        )}

                        <div id="barcode-reader" className="w-full h-full" />

                        {/* Custom Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 border-[4rem] border-black/40" />
                                <div className={`absolute top-1/2 left-0 w-full h-[2px] transition-all duration-300 ${showSuccess ? 'bg-white h-[4px] shadow-[0_0_30px_#fff]' : 'bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]'} animate-scan`} />
                                <div className={`absolute inset-[4rem] border-2 transition-all duration-300 ${showSuccess ? 'border-white scale-105 border-solid opacity-100' : 'border-primary border-dashed opacity-50'} rounded-2xl`} />
                            </div>
                        )}

                        {/* Status Badge */}
                        {isScanning && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Active
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 p-6 bg-destructive/10 border border-destructive/20 rounded-[2rem] flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                            <div>
                                <p className="text-lg font-bold text-destructive">Camera Error</p>
                                <p className="text-sm text-destructive/70 mt-1 font-medium">{error}</p>
                                <Button
                                    onClick={() => startScanner()}
                                    variant="outline"
                                    className="mt-4 rounded-xl border-destructive/20 hover:bg-destructive/10"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className={`mt-8 p-6 transition-all duration-500 rounded-[2rem] border ${showSuccess ? 'bg-primary/10 border-primary/20 translate-y-[-4px]' : 'bg-white/5 border-white/5'} text-center`}>
                        <p className={`text-sm font-bold tracking-wide transition-colors duration-500 ${showSuccess ? 'text-primary' : 'text-white/40'}`}>
                            {showSuccess ? "✓ ITEM ADDED TO CART" : "KEEP SCANNING TO ADD MORE PRODUCTS"}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
