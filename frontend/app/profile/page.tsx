'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import { Sport, Goal } from '@/types';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    bio: '',
    location: '',
    sport_ids: [] as number[],
    goal_ids: [] as number[],
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [sportsData, goalsData] = await Promise.all([
        api.getSports(),
        api.getGoals(),
      ]);
      setSports(sportsData);
      setGoals(goalsData);

      if (user) {
        setFormData({
          full_name: user.full_name || '',
          age: user.age?.toString() || '',
          bio: user.bio || '',
          location: user.location || '',
          sport_ids: user.sports?.map(s => s.id) || [],
          goal_ids: user.goals?.map(g => g.id) || [],
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };
      await api.updateUser(updateData);
      await refreshUser();
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sportId: number) => {
    setFormData(prev => ({
      ...prev,
      sport_ids: prev.sport_ids.includes(sportId)
        ? prev.sport_ids.filter(id => id !== sportId)
        : [...prev.sport_ids, sportId],
    }));
  };

  const toggleGoal = (goalId: number) => {
    setFormData(prev => ({
      ...prev,
      goal_ids: prev.goal_ids.includes(goalId)
        ? prev.goal_ids.filter(id => id !== goalId)
        : [...prev.goal_ids, goalId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sports Interests</label>
            <div className="grid grid-cols-3 gap-2">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => toggleSport(sport.id)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.sport_ids.includes(sport.id)
                      ? 'bg-[#00D9A5] text-black border-[#00D9A5] font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {sport.icon} {sport.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goals</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-4 py-2 rounded-lg border text-left transition-colors ${
                    formData.goal_ids.includes(goal.id)
                      ? 'bg-[#00D9A5] text-black border-[#00D9A5] font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {goal.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#00D9A5] text-black rounded-lg font-medium hover:bg-[#00B88A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

