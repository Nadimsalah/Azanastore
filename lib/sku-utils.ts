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

    return `${m}-${col}-${s}`;
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
