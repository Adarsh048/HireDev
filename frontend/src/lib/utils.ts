import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeExternalUrl(url?: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function formatDeadline(deadline?: string | Date): {
  label: string;
  isUrgent: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  formattedDate: string;
} {
  if (!deadline) {
    return {
      label: 'Rolling applications',
      isUrgent: false,
      isExpired: false,
      daysRemaining: null,
      formattedDate: 'Not specified',
    };
  }
  const date = new Date(deadline);
  if (isNaN(date.getTime())) {
    return {
      label: 'Rolling applications',
      isUrgent: false,
      isExpired: false,
      daysRemaining: null,
      formattedDate: 'Not specified',
    };
  }
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Applications closed',
      isUrgent: false,
      isExpired: true,
      daysRemaining: 0,
      formattedDate,
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Closes today!',
      isUrgent: true,
      isExpired: false,
      daysRemaining: 0,
      formattedDate,
    };
  }
  if (diffDays <= 7) {
    return {
      label: `${diffDays} days left to apply`,
      isUrgent: true,
      isExpired: false,
      daysRemaining: diffDays,
      formattedDate,
    };
  }
  return {
    label: `Apply by ${formattedDate} (${diffDays} days left)`,
    isUrgent: false,
    isExpired: false,
    daysRemaining: diffDays,
    formattedDate,
  };
}
