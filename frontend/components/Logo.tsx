'use client';

import Link from 'next/link';

export default function Logo({ size = 'large' }: { size?: 'small' | 'large' }) {
  const dimensions = size === 'large' ? 'w-32 h-20' : 'w-24 h-16';
  const textSize = size === 'large' ? 'text-4xl' : 'text-3xl';
  
  return (
    <Link href="/" className="flex items-center justify-center">
      <div className={`${dimensions} bg-[#00D9A5] rounded-lg flex items-center justify-center`}>
        <span className={`font-bold text-black tracking-tight ${textSize}`} style={{ fontFamily: 'system-ui, sans-serif' }}>
          D<span style={{ letterSpacing: '-0.05em' }}>OTS</span>
        </span>
      </div>
    </Link>
  );
}

