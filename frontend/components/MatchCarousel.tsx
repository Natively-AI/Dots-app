'use client';

import { useState } from 'react';
import SwipeableCard from './SwipeableCard';
import ProfileModal from './ProfileModal';

interface MatchCarouselProps {
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

export default function MatchCarousel({ matches, onSwipe, currentIndex, onIndexChange }: MatchCarouselProps) {
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProfile = () => {
    if (currentIndex < matches.length) {
      setSelectedProfile(matches[currentIndex]);
      setIsModalOpen(true);
    }
  };

  const handleSwipe = (direction: 'left' | 'right', userId: number) => {
    onSwipe(direction, userId);
    // Auto-advance after animation
    setTimeout(() => {
      if (currentIndex < matches.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    }, 500);
  };

  if (matches.length === 0) {
    return null;
  }

  // Get previous, current, and next card indices
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const nextIndex = currentIndex < matches.length - 1 ? currentIndex + 1 : null;

  return (
    <>
      <div className="relative w-full flex items-center justify-center" style={{ height: '650px' }}>
        {/* Previous Card (Left) */}
        {prevIndex !== null && (
          <div
            className="absolute flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              transform: 'translateX(-280px) scale(0.75)',
              opacity: 0.3,
              zIndex: 1,
              pointerEvents: 'none',
              width: '100%',
              maxWidth: '384px',
            }}
          >
            <SwipeableCard
              user={matches[prevIndex].user}
              score={matches[prevIndex].score}
              onSwipe={() => {}}
              onViewProfile={() => {}}
              index={1}
              total={3}
            />
          </div>
        )}

        {/* Current Card (Center) */}
        <div
          className="absolute flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            transform: 'translateX(0) scale(1)',
            opacity: 1,
            zIndex: 10,
            width: '100%',
            maxWidth: '384px',
          }}
        >
          <SwipeableCard
            user={matches[currentIndex].user}
            score={matches[currentIndex].score}
            onSwipe={(direction) => handleSwipe(direction, matches[currentIndex].user.id)}
            onViewProfile={handleViewProfile}
            index={0}
            total={1}
          />
        </div>

        {/* Next Card (Right) */}
        {nextIndex !== null && (
          <div
            className="absolute flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              transform: 'translateX(280px) scale(0.75)',
              opacity: 0.3,
              zIndex: 1,
              pointerEvents: 'none',
              width: '100%',
              maxWidth: '384px',
            }}
          >
            <SwipeableCard
              user={matches[nextIndex].user}
              score={matches[nextIndex].score}
              onSwipe={() => {}}
              onViewProfile={() => {}}
              index={1}
              total={3}
            />
          </div>
        )}
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
