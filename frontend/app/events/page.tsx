'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import EventCardLarge from '@/components/EventCardLarge';
import SearchBar from '@/components/SearchBar';
import FilterChips from '@/components/FilterChips';
import { api } from '@/lib/api';
import { Event, Sport } from '@/types';
import Link from 'next/link';

// Dynamically import EventsMap to avoid SSR issues with Leaflet
const EventsMap = dynamic(() => import('@/components/EventsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-3xl flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
});

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadData();
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to San Francisco if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      // Default to San Francisco if geolocation not available
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedSport, locationFilter, allEvents]);

  const loadData = async () => {
    try {
      const [eventsData, sportsData] = await Promise.all([
        api.getEvents(),
        api.getSports(),
      ]);
      setAllEvents(eventsData);
      setEvents(eventsData);
      setSports(sportsData);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...allEvents];

    // Filter by sport
    if (selectedSport !== null) {
      filtered = filtered.filter(event => event.sport?.id === selectedSport);
    }

    // Filter by location
    if (locationFilter.trim()) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(location)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.sport?.name.toLowerCase().includes(query)
      );
    }

    setEvents(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 animate-in fade-in duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#00D9A5] via-[#00B88A] to-[#00D9A5] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Discover Events
            </h1>
            <p className="text-xl text-white/90 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Find your next workout, connect with others, and stay active
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder="Search events by title, description, or location..."
            />
            
            {/* Location Filter */}
            <div>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location (e.g., City, State)"
                className="w-full pl-5 pr-5 py-4 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-400 shadow-lg"
              />
            </div>

            <FilterChips 
              sports={sports} 
              selectedSport={selectedSport} 
              onSportChange={setSelectedSport} 
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10 animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-gray-900">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
          </h2>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-xl p-1 shadow-md border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-[#00D9A5] text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  viewMode === 'map'
                    ? 'bg-[#00D9A5] text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🗺️ Map
              </button>
            </div>
            <Link 
              href="/events/create" 
              className="bg-[#00D9A5] text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-[#00B88A] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              + Create Event
            </Link>
          </div>
        </div>

        {/* Events Grid or Map */}
        {events.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery || selectedSport || locationFilter ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedSport || locationFilter
                ? 'Try adjusting your search or filters'
                : 'Be the first to create an event!'}
            </p>
            <Link 
              href="/events/create" 
              className="inline-block bg-[#00D9A5] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#00B88A] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Create Your First Event
            </Link>
          </div>
        ) : viewMode === 'map' ? (
          <div className="animate-in fade-in duration-500">
            <EventsMap events={events} userLocation={userLocation || undefined} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <div key={event.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                <EventCardLarge event={event} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

