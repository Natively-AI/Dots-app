'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo size="small" />
            <div className="flex items-center space-x-4">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-[#00D9A5] rounded-lg hover:bg-[#00B88A] transition-colors">
                Join
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/matches', label: 'Matches' },
    { href: '/messages', label: 'Messages' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 hidden md:block transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Logo size="small" />
            <div className="flex space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-[#E6F9F4] text-[#00B88A] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/profile'
                  ? 'bg-[#E6F9F4] text-[#00B88A] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

