'use client';

import { useState } from 'react';
import SwipeableCard from './SwipeableCard';
import ProfileModal from './ProfileModal';

interface BuddyGridProps {
  buddies: Array<{
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

export default function BuddyGrid({ buddies, onSwipe, currentIndex, onIndexChange }: BuddyGridProps) {
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProfile = (buddy: any) => {
    setSelectedProfile(buddy);
    setIsModalOpen(true);
  };

  const handleSwipe = (direction: 'left' | 'right', userId: number, index: number) => {
    onSwipe(direction, userId);
    // Auto-advance to next card if we liked
    if (direction === 'right' && index < buddies.length - 1) {
      setTimeout(() => {
        onIndexChange(index + 1);
      }, 300);
    }
  };

  if (buddies.length === 0) {
    return null;
  }

  // Show 1 card per row - full width
  const cardsPerRow = 1;
  const startIndex = currentIndex;
  const visibleBuddies = buddies.slice(startIndex, startIndex + cardsPerRow);

  return (
    <>
      <div className="grid grid-cols-1 gap-8">
        {visibleBuddies.map((buddy, idx) => {
          const actualIndex = startIndex + idx;
          return (
            <div key={buddy.user.id} className="relative group">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <SwipeableCard
                  user={buddy.user}
                  score={buddy.score}
                  onSwipe={(direction) => handleSwipe(direction, buddy.user.id, actualIndex)}
                  onViewProfile={() => handleViewProfile(buddy)}
                  index={0}
                  total={1}
                />
              </div>
              {/* Quick action buttons - visible on hover */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('left', buddy.user.id, actualIndex);
                  }}
                  className="flex-1 py-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors text-sm"
                >
                  Pass
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('right', buddy.user.id, actualIndex);
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
