'use client';

import { useState } from 'react';
import SwipeableCard from './SwipeableCard';
import ProfileModal from './ProfileModal';

interface MatchGridProps {
  matches: Array<{
    user: {
      id: number;
      full_name: string | null;
      age: number | null;
      location: string | null;
      avatar_url: string | null;
      bio: string | null;
      sports?: Array<{ id: number; name: string; icon?: string }>;
      goals?: Array<{ id: number; name: string }>;
    };
    score: number;
  }>;
  onSwipe: (direction: 'left' | 'right', userId: number) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function MatchGrid({ matches, onSwipe, currentIndex, onIndexChange }: MatchGridProps) {
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProfile = (match: any) => {
    setSelectedProfile(match);
    setIsModalOpen(true);
  };

  const handleSwipe = (direction: 'left' | 'right', userId: number, index: number) => {
    onSwipe(direction, userId);
    // Auto-advance to next card if we liked
    if (direction === 'right' && index < matches.length - 1) {
      setTimeout(() => {
        onIndexChange(index + 1);
      }, 300);
    }
  };

  if (matches.length === 0) {
    return null;
  }

  // Show 1 card per row - full width
  const cardsPerRow = 1;
  const startIndex = currentIndex;
  const visibleMatches = matches.slice(startIndex, startIndex + cardsPerRow);

  return (
    <>
      <div className="grid grid-cols-1 gap-8">
        {visibleMatches.map((match, idx) => {
          const actualIndex = startIndex + idx;
          return (
            <div key={match.user.id} className="relative group">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <SwipeableCard
                  user={match.user}
                  score={match.score}
                  onSwipe={(direction) => handleSwipe(direction, match.user.id, actualIndex)}
                  onViewProfile={() => handleViewProfile(match)}
                  index={0}
                  total={1}
                />
              </div>
              {/* Quick action buttons - visible on hover */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('left', match.user.id, actualIndex);
                  }}
                  className="flex-1 py-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors text-sm"
                >
                  Pass
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('right', match.user.id, actualIndex);
                  }}
                  className="flex-1 py-2.5 bg-[#00D9A5] text-black rounded-xl font-semibold hover:bg-[#00B88A] transition-colors shadow-lg text-sm"
                >
                  Like
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          user={selectedProfile.user}
          score={selectedProfile.score}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTimeout(() => setSelectedProfile(null), 300);
          }}
        />
      )}
    </>
  );
}

