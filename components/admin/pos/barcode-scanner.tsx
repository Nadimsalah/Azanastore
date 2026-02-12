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
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => {
        console.log(msg)
        setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`])
    }

    // Load scanner library
    useEffect(() => {
        if (window.Html5Qrcode) {
            setIsLibraryLoaded(true);
            addLog("Library already loaded");
            return;
        }

        addLog("Loading library from CDN...");
        const script = document.createElement("script");
        script.src = "https://unpkg.com/html5-qrcode";
        script.async = true;
        script.onload = () => {
            setIsLibraryLoaded(true);
            addLog("Library loaded successfully");
        };
        script.onerror = () => {
            const err = "Failed to load library";
            setError(err);
            addLog(err);
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
        }
    }, []);

    const startScanner = async () => {
        if (!isLibraryLoaded || !window.Html5Qrcode) return;

        // Reset state
        setError(null);
        addLog("Starting scanner initialization...");

        try {
            // Check for Secure Context (HTTPS or localhost)
            if (!window.isSecureContext) {
                const err = "Detected Insecure Context (HTTP). Camera likely blocked.";
                addLog(err);
                setError(err);
                return;
            }

            // Check permissions first
            addLog("Requesting camera permissions...");
            try {
                // We request it to trigger the prompt
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                setHasCameraPermission(true);
                addLog("Camera permission granted.");
            } catch (err: any) {
                const msg = `Permission denied: ${err.message || err.name}`;
                console.error(msg, err);
                setHasCameraPermission(false);
                setError("Camera permission denied.");
                addLog(msg);
                return;
            }

            if (!scannerRef.current) {
                scannerRef.current = new window.Html5Qrcode(scannerRegionId);
                addLog("Scanner instance created.");
            }

            // Enumerate Cameras
            addLog("Enumerating cameras...");
            let cameraDevices = [];
            try {
                cameraDevices = await window.Html5Qrcode.getCameras();
                addLog(`Found ${cameraDevices.length} cameras.`);
            } catch (enumErr: any) {
                addLog(`Enumeration failed: ${enumErr}`);
                throw enumErr;
            }

            if (cameraDevices.length === 0) {
                throw new Error("No cameras found.");
            }

            // intelligent selection: prefer back camera
            let selectedCameraId = cameraDevices[0].id; // Default to first
            const backCamera = cameraDevices.find((device: any) =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('environment') ||
                device.label.toLowerCase().includes('rear')
            );

            if (backCamera) {
                selectedCameraId = backCamera.id;
                addLog(`Selected Back Camera: ${backCamera.label}`);
            } else {
                addLog(`Using Default Camera: ${cameraDevices[0].label}`);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }, // Simplified for debugging
                aspectRatio: 1.0
            };

            const onScanSuccess = (decodedText: string) => {
                if (scannerRef.current?.getState() === 2) {
                    scannerRef.current.pause(true);
                    onScan(decodedText);
                    setLastScanned(decodedText);
                    setIsPaused(true);
                    if (navigator.vibrate) navigator.vibrate(200);
                    addLog(`Scanned: ${decodedText}`);
                }
            };

            addLog(`Starting camera ID: ${selectedCameraId.substring(0, 10)}...`);
            await scannerRef.current.start(
                selectedCameraId,
                config,
                onScanSuccess,
                (errorMessage: string) => {
                    // verbose logging of frame errors can be noisy
                }
            );
            addLog("Camera started successfully.");

        } catch (err: any) {
            console.error("Scanner fatal error:", err);

            // formatting the error message to be visible
            let errorMsg = "Unknown Error";
            if (typeof err === "string") {
                errorMsg = err;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            } else {
                try {
                    errorMsg = JSON.stringify(err);
                } catch (e) {
                    errorMsg = "Critical Unknown Error";
                }
            }

            addLog(`Fatal Error: ${errorMsg}`);

            let userMessage = "Failed to start camera.";
            if (errorMsg.includes("Permission")) {
                userMessage = "Camera permission denied.";
            } else if (errorMsg.includes("No camera")) {
                userMessage = "No camera found on this device.";
            }

            setError(`${userMessage} (${errorMsg.substring(0, 30)}...)`);
        }
    };

    // Auto-start on load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLibraryLoaded && !scannerRef.current?.isScanning) {
                startScanner();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [isLibraryLoaded, onScan]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch((e: any) => console.error("Stop error:", e));
            }
        }
    }, []);

    const handleResume = () => {
        setIsPaused(false);
        setLastScanned(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
            addLog("Resumed scanning.");
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
                            {isLibraryLoaded ? "System Ready" : "Initializing..."}
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

                    {/* Loading/Error State Overlay */}
                    {(!isLibraryLoaded || error) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/90 z-20 p-6 text-center">
                            {error ? (
                                <>
                                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Scanner Error</h3>
                                    <p className="text-white/60 mb-6 max-w-xs">{error}</p>
                                    <Button onClick={() => startScanner()} className="mb-4">
                                        Retry Camera
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary" />
                                    <p>Loading Component...</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Debug Console (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-50 pointer-events-none opacity-50">
                        <div className="bg-black/50 p-2 rounded text-[10px] font-mono text-green-400 max-w-[200px] overflow-hidden">
                            {logs.map((log, i) => (
                                <div key={i} className="truncate">{log}</div>
                            ))}
                        </div>
                    </div>

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
