"use client"

import { useEffect, useRef, useState } from "react"
import { X, Sparkles, Barcode, CheckCircle2, Camera, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

declare global {
    interface Window {
        Html5Qrcode: any
    }
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const { t } = useLanguage()
    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
    const scannerRef = useRef<any>(null)
    const scannerRegionId = "html5qr-code-full-region"

    // Load scanner library
    useEffect(() => {
        if (window.Html5Qrcode) {
            setIsLibraryLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/html5-qrcode";
        script.async = true;
        script.onload = () => setIsLibraryLoaded(true);
        script.onerror = () => setError("Failed to load scanner library. Please check internet connection.");
        document.body.appendChild(script);

        return () => {
            // Cleanup
        }
    }, []);

    // Initialize Scanner
    useEffect(() => {
        if (!isLibraryLoaded || !window.Html5Qrcode) return;

        const startScanner = async () => {
            try {
                // Check for Secure Context (HTTPS or localhost)
                if (!window.isSecureContext) {
                    setError("Camera access requires HTTPS or localhost. Please check your connection security.");
                    return;
                }

                // Check permissions first
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking
                    setHasCameraPermission(true);
                } catch (err) {
                    console.error("Permission check failed:", err);
                    setHasCameraPermission(false);
                    setError("Camera permission denied. Please allow camera access in your browser settings.");
                    return;
                }

                if (!scannerRef.current) {
                    scannerRef.current = new window.Html5Qrcode(scannerRegionId);
                }

                const config = {
                    fps: 10,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        // Responsive box size
                        const minEdgePercentage = 0.70; // 70%
                        const minSize = Math.min(viewfinderWidth, viewfinderHeight);
                        const boxSize = Math.floor(minSize * minEdgePercentage);
                        return {
                            width: boxSize,
                            height: Math.floor(boxSize * 0.6) // Rectangular for barcodes
                        };
                    },
                    aspectRatio: 1.0
                };

                await scannerRef.current.start(
                    { facingMode: "environment" }, // Prefer back camera
                    config,
                    (decodedText: string) => {
                        // Check lock to prevent double-scanning in the same frame
                        if (scannerRef.current?.getState() === 2) { // 2 = SCANNING
                            scannerRef.current.pause(true); // Pause scanning, keep feed
                            onScan(decodedText);
                            setLastScanned(decodedText);
                            setIsPaused(true);
                            if (navigator.vibrate) navigator.vibrate(200);
                        }
                    },
                    () => { /* Ignore frame failures */ }
                );

            } catch (err: any) {
                console.error("Scanner start error:", err);
                let errorMessage = "Failed to start camera.";
                if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                    errorMessage = "Camera permission denied.";
                } else if (err?.name === "NotFoundError") {
                    errorMessage = "No camera found on this device.";
                } else if (err?.name === "NotReadableError") {
                    errorMessage = "Camera is already in use by another app.";
                } else if (err?.name === "OverconstrainedError") {
                    // Fallback to any camera if environment facing mode fails
                    try {
                        await scannerRef.current.start(
                            true, // Use default camera
                            config,
                            (decodedText: string) => {
                                if (scannerRef.current?.getState() === 2) {
                                    scannerRef.current.pause(true);
                                    onScan(decodedText);
                                    setLastScanned(decodedText);
                                    setIsPaused(true);
                                    if (navigator.vibrate) navigator.vibrate(200);
                                }
                            },
                            () => { }
                        );
                        return; // Success on fallback
                    } catch (fallbackErr) {
                        errorMessage = "Could not start any camera.";
                    }
                }
                setError(errorMessage);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(startScanner, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch((e: any) => console.error("Create stop error:", e));
            }
        };
    }, [isLibraryLoaded, onScan]);

    const handleResume = () => {
        setIsPaused(false);
        setLastScanned(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col md:justify-center">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 text-white md:absolute md:top-0 md:left-0 md:right-0 md:z-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <Barcode className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{t("admin.pos.scanner")}</h2>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">
                            {isLibraryLoaded ? "Ready" : "Loading..."}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-2xl mx-auto p-4 md:h-[600px]">

                {/* Camera Container */}
                <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <div id={scannerRegionId} className="w-full h-full object-cover" />

                    {/* Loading State */}
                    {!isLibraryLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black z-20">
                            <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary" />
                            <p className="text-sm font-medium opacity-70">Starting Camera...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/90 z-30 p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                            <p className="text-white/60 mb-8">{error}</p>
                            <Button onClick={onClose} variant="secondary" className="rounded-full px-8">
                                Close Scanner
                            </Button>
                        </div>
                    )}

                    {/* Success Overlay */}
                    <AnimatePresence>
                        {isPaused && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 bg-primary/95 flex flex-col items-center justify-center text-white z-40 p-6 text-center backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-primary"
                                >
                                    <CheckCircle2 className="w-12 h-12" strokeWidth={3} />
                                </motion.div>
                                <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Scanned!</h3>
                                <p className="font-mono text-xl text-white/90 mb-12 bg-black/20 px-6 py-2 rounded-lg">
                                    {lastScanned}
                                </p>

                                <Button
                                    onClick={handleResume}
                                    className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all w-full max-w-xs"
                                >
                                    Scan Next
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Helper Text */}
                {!error && !isPaused && (
                    <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white/80"
                        >
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            Point camera at a barcode
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
