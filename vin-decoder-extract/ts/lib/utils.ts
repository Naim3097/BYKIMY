import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '--';
  return value.toFixed(decimals);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '--';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-byki-danger';
  if (severity >= 6) return 'text-byki-warning';
  if (severity >= 4) return 'text-yellow-500';
  return 'text-byki-success';
}

export function getSeverityBg(severity: number): string {
  if (severity >= 8) return 'bg-byki-danger/20 border-byki-danger/50';
  if (severity >= 6) return 'bg-byki-warning/20 border-byki-warning/50';
  if (severity >= 4) return 'bg-yellow-500/20 border-yellow-500/50';
  return 'bg-byki-success/20 border-byki-success/50';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ONLINE':
    case 'EXCELLENT':
    case 'GOOD':
      return 'text-byki-success';
    case 'DEGRADED':
    case 'FAIR':
      return 'text-byki-warning';
    case 'OFFLINE':
    case 'POOR':
    case 'NO_RESPONSE':
      return 'text-byki-danger';
    default:
      return 'text-gray-400';
  }
}

export function getDeviationColor(deviation: number): string {
  if (deviation > 30) return 'text-byki-danger';
  if (deviation > 15) return 'text-byki-warning';
  return 'text-byki-success';
}

/**
 * Consistently mask a VIN for display/print (PDPA compliance).
 * Shows WMI (first 3) + last 4, masks the rest.
 * e.g. "WBA12345678901234" → "WBA*********1234"
 */
export function maskVin(vin: string): string {
  if (!vin || vin.length < 7) return vin || 'N/A';
  const wmi = vin.slice(0, 3);
  const tail = vin.slice(-4);
  const masked = '*'.repeat(vin.length - 7);
  return `${wmi}${masked}${tail}`;
}
