"use client"

import { useEffect, useRef, useState } from "react"
import { X, RefreshCw, AlertCircle, CheckCircle2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser"
import { DecodeHintType, BarcodeFormat } from "@zxing/library"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const { t } = useLanguage()
    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true) // Controls the "Scan Next" flow
    const [isInitializing, setIsInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
    const [activeCameraId, setActiveCameraId] = useState<string | undefined>(undefined)

    const videoRef = useRef<HTMLVideoElement>(null)
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
    const controlsRef = useRef<any>(null) // To stop/start scanning

    // Initialize Reader
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                // Initialize with ALL formats and TRY_HARDER for better detection
                const hints = new Map();
                const formats = [
                    BarcodeFormat.EAN_13,
                    BarcodeFormat.EAN_8,
                    BarcodeFormat.UPC_A,
                    BarcodeFormat.UPC_E,
                    BarcodeFormat.UPC_EAN_EXTENSION,
                    BarcodeFormat.CODE_128,
                    BarcodeFormat.CODE_39,
                    BarcodeFormat.CODE_93,
                    BarcodeFormat.CODABAR,
                    BarcodeFormat.ITF,
                    BarcodeFormat.QR_CODE,
                    BarcodeFormat.DATA_MATRIX,
                    BarcodeFormat.AZTEC,
                    BarcodeFormat.PDF_417
                ];
                hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
                hints.set(DecodeHintType.TRY_HARDER, true);

                // Cast hints to any to avoid version mismatch type errors between @zxing/browser and @zxing/library
                const reader = new BrowserMultiFormatReader(hints as any);
                codeReaderRef.current = reader;

                // 0. Explicitly Request Permission First
                // This is crucial on iOS/Android to unlock the ability to enumerate devices
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    // We just need the permission, so we can stop this immediate stream
                    stream.getTracks().forEach(track => track.stop());
                } catch (permErr) {
                    console.error("Permission request failed", permErr);
                    // Continue anyway, maybe we already have permission or can fallback
                }

                // 1. List Cameras
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                if (!mounted) return;

                setAvailableCameras(devices);

                // 2. Select Best Camera
                let selectedId: string | undefined = undefined;

                if (devices.length > 0) {
                    const backCamera = devices.find(d =>
                        d.label.toLowerCase().includes("back") ||
                        d.label.toLowerCase().includes("environment") ||
                        d.label.toLowerCase().includes("rear")
                    );
                    selectedId = backCamera ? backCamera.deviceId : devices[0].deviceId;
                }

                // If no devices found (privacy shielding), we pass undefined to let the library pick the default
                setActiveCameraId(selectedId);

                if (devices.length === 0) {
                    // Don't throw here, just try with default
                    console.warn("No cameras enumerated, trying default device...");
                }

            } catch (err: any) {
                console.error("Initialization Error:", err);
                if (mounted) {
                    setError(err.message || "Failed to access camera");
                    setIsInitializing(false);
                }
            }
        };

        const timer = setTimeout(init, 500); // Small delay to ensure mount

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, []);

    // Active Scanning Effect
    useEffect(() => {
        if (!activeCameraId || !videoRef.current) return;

        // If we are NOT scanning (showing success screen), stop the camera to save resources/prevent bg scanning
        if (!isScanning) {
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
            }
            return;
        }

        const startDecoding = async () => {
            setIsInitializing(true);
            setError(null);

            try {
                if (!codeReaderRef.current) return;

                // Decode from video device
                // We use a try-catch block inside to handle start failures
                const controls = await codeReaderRef.current.decodeFromVideoDevice(
                    activeCameraId,
                    videoRef.current!,
                    (result, err, controls) => {
                        if (result) {
                            const text = result.getText();
                            if (text) {
                                // Stop specifically this control instance
                                controls.stop();
                                controlsRef.current = null;
                                handleScan(text);
                            }
                        }
                    }
                );
                controlsRef.current = controls;
                setIsInitializing(false);
            } catch (err: any) {
                console.error("Start Control Error:", err);
                setError("Could not start video stream");
                setIsInitializing(false);
            }
        };

        startDecoding();

        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
            }
        };

    }, [activeCameraId, isScanning]);

    const handleScan = (text: string) => {
        if (navigator.vibrate) navigator.vibrate(200);
        setLastScanned(text);
        setIsScanning(false); // Pause scanning, show confirmation UI
    };

    const confirmAddToCart = () => {
        if (lastScanned) {
            onScan(lastScanned);
            // Instant resume for "fast scanning"
            setLastScanned(null);
            setIsScanning(true);
        }
    };

    const handleDone = () => {
        onClose();
    };

    const handleRescan = () => {
        setLastScanned(null);
        setIsScanning(true);
    };

    const switchCamera = () => {
        if (availableCameras.length < 2) return;

        const currentIndex = availableCameras.findIndex(c => c.deviceId === activeCameraId);
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        setActiveCameraId(availableCameras[nextIndex].deviceId);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/10" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="font-bold text-lg">Scanner</h2>
                        <p className="text-xs text-white/60">
                            {availableCameras.length > 0 ? `${availableCameras.length} Cameras Found` : "Searching..."}
                        </p>
                    </div>
                </div>
                {availableCameras.length > 1 && (
                    <Button variant="outline" size="icon" onClick={switchCamera} className="rounded-full border-white/20 bg-transparent text-white">
                        <Video className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Video Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                />

                {/* Focus Guide Overlay & Re-scan Icon */}
                {isScanning && !lastScanned && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-72 h-48 border-2 border-white/50 rounded-xl relative mb-8">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mb-1 -mr-1" />

                            {/* Scanning Line Animation */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                            />
                        </div>

                        {/* Re-scan Icon (Under Frame as requested) */}
                        <div className="pointer-events-auto mt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRescan}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 active:scale-95 transition-all"
                            >
                                <RefreshCw className="w-6 h-6 text-white" />
                            </Button>
                            <p className="text-[10px] text-white/60 mt-2 text-center uppercase tracking-widest font-bold">Reset</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isInitializing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
                        <RefreshCw className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-sm font-medium text-white/80">Starting Camera...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                        <p className="text-white/60 mb-6">{error}</p>
                        <Button onClick={onClose} variant="secondary">Close Scanner</Button>
                    </div>
                )}
            </div>

            {/* Success Action Sheet */}
            <AnimatePresence>
                {!isScanning && lastScanned && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 z-30 bg-white text-black p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-wide mb-1">Code Detected</h3>
                            <p className="text-2xl font-mono font-bold text-gray-900 mb-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">
                                {lastScanned}
                            </p>

                            <div className="flex w-full gap-3">
                                <Button
                                    onClick={handleDone}
                                    variant="outline"
                                    className="flex-1 h-14 text-base font-bold rounded-xl border-gray-200"
                                >
                                    Done
                                </Button>
                                <Button
                                    onClick={confirmAddToCart}
                                    className="flex-[2] h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
