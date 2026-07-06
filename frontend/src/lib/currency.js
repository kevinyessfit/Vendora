// XOF (FCFA) has no subunit — always render as a rounded integer.
export function formatCurrency(amount) {
    const value = Math.round(Number(amount) || 0);
    return `${value.toLocaleString('fr-FR')} FCFA`;
}
