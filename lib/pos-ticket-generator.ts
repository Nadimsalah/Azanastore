import { jsPDF } from "jspdf"
import { type CartItem } from "./supabase-api"

export const generatePOSTicketPDF = (items: CartItem[], total: number) => {
    // Estimate height: Header (25) + Items (8 per item) + Total (15) + Footer (15)
    const estimatedHeight = 60 + (items.length * 10)

    const doc = new jsPDF({
        unit: "mm",
        format: [80, Math.max(120, estimatedHeight)],
        putOnlyUsedFonts: true
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 15

    // Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("AZANA STORE", pageWidth / 2, y, { align: "center" })
    y += 8

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("CASABLANCA, MOROCCO", pageWidth / 2, y, { align: "center" })
    y += 4
    doc.text(new Date().toLocaleString(), pageWidth / 2, y, { align: "center" })
    y += 8

    // Divider
    doc.setLineWidth(0.2)
    doc.line(5, y, pageWidth - 5, y)
    y += 8

    // Items Header
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("DESCRIPTION", 5, y)
    doc.text("QTY", 45, y, { align: "center" })
    doc.text("TOTAL", 75, y, { align: "right" })
    y += 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    items.forEach((item) => {
        const title = item.title.toUpperCase()
        const splitTitle = doc.splitTextToSize(title, 35)

        // Check if we need a new page (unlikely for thermal but good practice)
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            y = 15
        }

        doc.text(splitTitle, 5, y)
        doc.text(item.quantity.toString(), 45, y, { align: "center" })
        doc.text((item.price * item.quantity).toFixed(2), 75, y, { align: "right" })

        y += (splitTitle.length * 4)

        if (item.variant_name) {
            doc.setFontSize(7)
            doc.text(`VARIANT: ${item.variant_name.toUpperCase()}`, 5, y - 1)
            y += 4
            doc.setFontSize(8)
        }
        y += 2
    })

    y += 4
    doc.setLineWidth(0.1)
    doc.line(5, y, pageWidth - 5, y)
    y += 10

    // Total
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("TOTAL:", 5, y)
    doc.text(`${total.toFixed(2)} MAD`, 75, y, { align: "right" })
    y += 15

    // Footer
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("THANK YOU FOR YOUR VISIT", pageWidth / 2, y, { align: "center" })
    y += 5
    doc.text("azana.com", pageWidth / 2, y, { align: "center" })

    // Output
    const blob = doc.output("blob")
    const blobURL = URL.createObjectURL(blob)

    // For mobile/desktop "appear in print request"
    // We recreate a temporary iframe to trigger print specifically for the PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = blobURL;
    document.body.appendChild(iframe);

    iframe.onload = () => {
        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch (e) {
            // Fallback for some browsers: open in new tab
            window.open(blobURL, '_blank');
        }
    };

    // Also save it for convenience
    const fileName = `azana-ticket-${Date.now()}.pdf`
    doc.save(fileName)
}
