'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Event, Sport, Goal, Conversation } from '@/types';

/** Cache events - instant display when switching tabs. Revalidate on focus. */
export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR<Event[]>(
    'events',
    () => api.getEvents(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Don't refetch within 10s
      revalidateOnReconnect: true,
    }
  );
  return { events: data ?? [], isLoading, error, mutate };
}

/** Sports rarely change - cache for 5 min */
export function useSports() {
  const { data, error, isLoading } = useSWR<Sport[]>(
    'sports',
    () => api.getSports(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 min
    }
  );
  return { sports: data ?? [], isLoading, error };
}

/** Goals rarely change - cache for 5 min */
export function useGoals() {
  const { data, error, isLoading } = useSWR<Goal[]>(
    'goals',
    () => api.getGoals(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 min
    }
  );
  return { goals: data ?? [], isLoading, error };
}

/** Buddies - cache for tab switching */
export function useBuddies() {
  const { data, error, isLoading, mutate } = useSWR(
    'buddies',
    () => api.getBuddies(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 15000,
    }
  );
  return { buddies: data ?? [], isLoading, error, mutate };
}

/** Conversations - cache for tab switching */
export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<Conversation[]>(
    'conversations',
    () => api.getConversations(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Shorter - messages change often
    }
  );
  return { conversations: data ?? [], isLoading, error, mutate };
}
