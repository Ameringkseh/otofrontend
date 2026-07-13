import React from 'react';

/**
 * Skeleton - animated shimmer placeholder
 * @param {string} className - tambahan class Tailwind (width, height, dll)
 */
export function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton-shimmer rounded-lg ${className}`} />
  );
}

/**
 * SkeletonRow - satu baris skeleton untuk tabel touring
 */
export function SkeletonRow({ cols = 6 }) {
  const widths = ['w-32', 'w-24', 'w-28', 'w-12', 'w-16', 'w-36'];
  return (
    <tr className="border-b border-slate-800/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className={`h-4 ${widths[i % widths.length]}`} />
        </td>
      ))}
    </tr>
  );
}

/**
 * SkeletonCard - card skeleton untuk Touring Saya
 */
export function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-56" />
      <div className="flex gap-2 pt-2 border-t border-slate-700">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

/**
 * SkeletonText - baris teks skeleton
 */
export function SkeletonText({ lines = 3, className = '' }) {
  const widths = ['w-full', 'w-4/5', 'w-3/5'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}
