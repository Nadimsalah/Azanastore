"use client"

import React, { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"
import { useLanguage } from "@/components/language-provider"

interface SKUStickerProps {
    title: string
    sku: string
    size?: string | null
    color?: string | null
    price?: number
}

export function SKUSticker({ title, sku, size, color, price }: SKUStickerProps) {
    const { t } = useLanguage()
    const barcodeRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (barcodeRef.current && sku) {
            try {
                JsBarcode(barcodeRef.current, sku, {
                    format: "CODE128",
                    width: 2,
                    height: 50,
                    displayValue: false, // We show SKU separately for better design
                    margin: 0,
                    background: "#ffffff"
                })
            } catch (err) {
                console.error("Barcode generation failed:", err)
            }
        }
    }, [sku])

    return (
        <div className="sticker-outer-container relative p-[1px]">
            {/* Cutting Guides (Dashed border) */}
            <div className="sticker-container p-3 bg-white text-black border border-dashed border-black/40 w-[50mm] h-[30mm] flex flex-col justify-between overflow-hidden font-sans relative">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-[10px] font-black uppercase truncate leading-tight tracking-tight">Azana Boutique</h2>
                    <div className="border-t border-black/10 my-1" />
                </div>

                {/* Barcode Section */}
                <div className="flex-1 flex flex-col items-center justify-center py-1 overflow-hidden">
                    <svg ref={barcodeRef} className="max-w-full h-auto max-h-[14mm]" />
                    <span className="text-[14px] font-black tracking-[0.2em] leading-none mt-1">
                        {sku}
                    </span>
                </div>

                {/* Footer with Metadata */}
                <div className="border-t border-black/10 pt-1 mt-1">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[8px] font-black uppercase truncate mb-0.5">{title}</h3>
                            <div className="flex gap-2">
                                {size && (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[6px] text-black/40 font-bold uppercase leading-none">{t("common.size")}:</span>
                                        <span className="text-[8px] font-black uppercase leading-none">{size}</span>
                                    </div>
                                )}
                                {color && (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[6px] text-black/40 font-bold uppercase leading-none">{t("common.color")}:</span>
                                        <span className="text-[8px] font-black uppercase leading-none">{color}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner cutting guides */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/50" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-black/50" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-black/50" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/50" />

            <style jsx>{`
                @media screen {
                    .sticker-outer-container {
                        display: none;
                    }
                }
                @media print {
                    .sticker-outer-container {
                        display: block !important;
                        margin: 0;
                        padding: 0;
                        width: 50mm;
                        height: 30mm;
                        page-break-inside: avoid;
                    }
                    .sticker-container {
                        display: flex !important;
                        margin: 0;
                        width: 50mm;
                        height: 30mm;
                        border: 1px dashed rgba(0,0,0,0.4) !important;
                    }
                }
            `}</style>
        </div>
    )
}
