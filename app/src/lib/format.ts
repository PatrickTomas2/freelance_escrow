/** Shortens a Stellar address for display, e.g. "GABC…WXYZ". */
export function truncateAddress(address: string, visible = 4): string {
  if (address.length <= visible * 2 + 1) return address;
  return `${address.slice(0, visible)}…${address.slice(-visible)}`;
}

/** Formats a raw Horizon XLM balance string for display. */
export function formatXlmBalance(balance: string, maxDecimals = 4): string {
  const num = parseFloat(balance);
  if (Number.isNaN(num)) return balance;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
}
