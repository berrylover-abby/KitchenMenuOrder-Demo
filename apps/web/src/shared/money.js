const formatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
export function formatMoney(cents) { return formatter.format(cents / 100); }
