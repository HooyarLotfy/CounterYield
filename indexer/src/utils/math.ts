export function calculateBps(part: bigint, total: bigint): bigint {
  if (total === 0n) return 0n;
  return (part * 10000n) / total;
}

export function formatAddress(address: string): string {
  return address.toLowerCase();
}
