'use client';

import Link from 'next/link';

interface MatchCardProps {
  user: {
    id: number;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    sports?: Array<{ id: number; name: string }>;
  };
  score: number;
}

export default function MatchCard({ user, score }: MatchCardProps) {
  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Link href="/matches">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-14 h-14 bg-gradient-to-br from-[#00D9A5] to-[#00B88A] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || ''} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {user.full_name || 'Anonymous'}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-semibold text-[#00D9A5]">
                {score}% match
              </span>
              {user.location && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="text-xs text-gray-500 truncate">{user.location}</span>
                </>
              )}
            </div>
            {user.sports && user.sports.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.sports.slice(0, 2).map((sport) => (
                  <span
                    key={sport.id}
                    className="text-xs bg-[#E6F9F4] text-[#00B88A] px-2 py-0.5 rounded-full font-medium"
                  >
                    {sport.name}
                  </span>
                ))}
                {user.sports.length > 2 && (
                  <span className="text-xs text-gray-400">+{user.sports.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

