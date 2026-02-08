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

    // Load library from CDN
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

        return () => {
            // We don't remove the script to avoid reloading it if opened again
        }
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

            // Configuration for the scanner
            const config = {
                fps: 20,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0,
            }

            const onScanSuccess = (decodedText: string) => {
                if (decodedText !== lastScanned) {
                    setLastScanned(decodedText)
                    onScan(decodedText)
                    setTimeout(() => {
                        stopScanner()
                        onClose()
                    }, 500)
                }
            }

            // Try environment (back) camera first
            try {
                console.log("Attempting to start scanner with back camera...")
                await scanner.start({ facingMode: "environment" }, config, onScanSuccess, () => { })
            } catch (envError) {
                console.warn("Environment camera not found or failed:", envError)

                // Fallback to any available camera (usually front on many devices)
                console.log("Attempting fallback to default camera...")
                try {
                    await scanner.start({ facingMode: "user" }, config, onScanSuccess, () => { })
                } catch (userError) {
                    console.warn("User camera also failed:", userError)

                    // Last resort: just try to start with any camera
                    console.log("Attempting last resort: any camera...")
                    await scanner.start({}, config, onScanSuccess, () => { })
                }
            }

            setIsScanning(true)
            setError(null)
        } catch (err: any) {
            console.error("Scanner failed completely:", err)
            setError(err.message || "Could not access any camera. Please check permissions and ensure you are on HTTPS.")
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10">
                                <Camera className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Scanner</h2>
                                <p className="text-sm text-white/50 font-medium">Place product barcode in frame</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                stopScanner()
                                onClose()
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-14 w-14 rounded-2xl text-white hover:bg-white/5 active:scale-90 transition-all"
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>

                    {/* Scanner View */}
                    <div className="relative aspect-square md:aspect-video rounded-[2rem] overflow-hidden bg-white/5 border-2 border-primary/20 shadow-inner">
                        {!libLoaded && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Initializing Scanner...</p>
                            </div>
                        )}

                        <div id="barcode-reader" className="w-full h-full" />

                        {/* Custom Overlay for Scanner */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 border-[4rem] border-black/40" />
                                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-scan" />
                                <div className="absolute inset-[4rem] border-2 border-primary border-dashed opacity-50 rounded-2xl" />
                            </div>
                        )}

                        {/* Status Badge */}
                        {isScanning && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-primary rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Live
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-6 bg-destructive/10 border border-destructive/20 rounded-[2rem] flex items-start gap-4"
                        >
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
                        </motion.div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                        <p className="text-sm text-white/40 font-medium">
                            The scanner will automatically detect barcodes and add items to your cart.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
