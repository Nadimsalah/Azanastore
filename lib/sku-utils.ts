/**
 * SKU Generation Utility for Azana
 * Format: CATEGORY-MODEL-COLOR-SIZE
 * Example: CLO-TSH-BLK-L
 */

export function generateSKU(
    category: string,
    model: string,
    color: string,
    size: string
): string {
    const sanitize = (val: string) => {
        return val
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 3);
    };

    const m = sanitize(model) || 'PRD';
    const col = sanitize(color) || 'NA';
    const s = sanitize(size) || 'NA';
    
    // Add a small random suffix to ensure uniqueness in DB
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${m}-${col}-${s}-${random}`;
}

export function parseSKU(sku: string) {
    const parts = sku.split('-');
    return {
        category: parts[0] || '',
        model: parts[1] || '',
        color: parts[2] || '',
        size: parts[3] || ''
    };
}
