'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Event } from '@/types';
import Image from 'next/image';

interface EventAdminPanelProps {
  event: Event;
  onUpdate: () => void;
}

export default function EventAdminPanel({ event, onUpdate }: EventAdminPanelProps) {
  const [rsvps, setRsvps] = useState<{ approved: User[]; pending: User[]; rejected: User[] }>({
    approved: [],
    pending: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('pending');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    location: event.location,
    max_participants: event.max_participants?.toString() || '',
    is_public: event.is_public,
    cover_image_url: event.cover_image_url || '',
  });

  useEffect(() => {
    loadRSVPs();
  }, [event.id]);

  const loadRSVPs = async () => {
    try {
      const data = await api.getEventRSVPs(event.id);
      setRsvps(data);
    } catch (error) {
      console.error('Failed to load RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await api.approveRSVP(event.id, userId);
      await loadRSVPs();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to approve RSVP');
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await api.rejectRSVP(event.id, userId);
      await loadRSVPs();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to reject RSVP');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.updateEvent(event.id, {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      });
      setEditing(false);
      onUpdate();
      alert('Event updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update event');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading RSVPs...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Event Admin</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          {editing ? 'Cancel' : 'Edit Event'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
              Public Event (anyone can RSVP)
            </label>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full bg-[#0ef9b4] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#0dd9a0] transition-colors"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-[#0ef9b4] border-b-2 border-[#0ef9b4]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
              {rsvps.pending.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {rsvps.pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-[#0ef9b4] border-b-2 border-[#0ef9b4]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approved ({rsvps.approved.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'rejected'
                  ? 'text-[#0ef9b4] border-b-2 border-[#0ef9b4]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected ({rsvps.rejected.length})
            </button>
          </div>

          {/* RSVP Lists */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeTab === 'pending' && (
              <>
                {rsvps.pending.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending requests</p>
                ) : (
                  rsvps.pending.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0ef9b4] flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <Image src={user.avatar_url} alt={user.full_name || ''} width={40} height={40} className="object-cover" />
                          ) : (
                            <span className="text-black font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.full_name || 'User'}</p>
                          {user.location && <p className="text-sm text-gray-600">{user.location}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-4 py-1.5 bg-[#0ef9b4] text-black rounded-lg font-medium hover:bg-[#0dd9a0] transition-colors text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <>
                {rsvps.approved.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No approved RSVPs</p>
                ) : (
                  rsvps.approved.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#0ef9b4] flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.full_name || ''} width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="text-black font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.full_name || 'User'}</p>
                        {user.location && <p className="text-sm text-gray-600">{user.location}</p>}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'rejected' && (
              <>
                {rsvps.rejected.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No rejected RSVPs</p>
                ) : (
                  rsvps.rejected.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.full_name || ''} width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="text-gray-600 font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.full_name || 'User'}</p>
                        {user.location && <p className="text-sm text-gray-600">{user.location}</p>}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
