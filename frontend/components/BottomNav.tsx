'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/events', icon: '📅', label: 'Events' },
    { href: '/buddies', icon: '🔍', label: 'Buddies' },
    { href: '/messages', icon: '💬', label: 'Messages' },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#00D9A5] border-t border-[#00B88A] z-50 md:hidden backdrop-blur-sm">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                active 
                  ? 'text-black scale-110' 
                  : 'text-black/70 hover:text-black/90'
              }`}
            >
              <span className={`text-xl mb-1 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

