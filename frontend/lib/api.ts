import { Event, Sport, User, Buddy, GroupChat, Conversation, Goal, Message, GroupMember, Post } from '@/types';
import {
  mockUsers,
  mockEvents,
  mockBuddies,
  mockSuggestedBuddies,
  mockConversations,
  mockMessages,
  mockGroupChats,
  mockSports,
  mockGoals,
  currentUser,
} from './mockData';
import { supabase } from './supabase';

// Use mock data - simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiClient {
  private localBuddies: Buddy[] = [...mockBuddies];
  private localMessages: Message[] = [...mockMessages];
  private localEvents: Event[] = [...mockEvents];
  private rsvpEvents: Set<number> = new Set();
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  setToken(token: string | null) {
    // Token is managed by Supabase, this is kept for compatibility
  }

  // Auth
  async register(email: string, password: string, fullName: string): Promise<{ access_token: string; token_type: string }> {
    await delay(300);
    this.setToken('mock_token');
    return { access_token: 'mock_token', token_type: 'bearer' };
  }

  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    await delay(300);
    this.setToken('mock_token');
    return { access_token: 'mock_token', token_type: 'bearer' };
  }

  // Users
  async getCurrentUser(): Promise<User> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        // Backend not available - throw error with helpful message
        console.warn('Backend not available for getCurrentUser:', this.baseUrl);
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  async getUser(userId: number): Promise<User> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch user' }));
        throw new Error(errorData.detail || 'Failed to fetch user');
      }
      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      throw error;
    }
  }

  async updateUser(data: any): Promise<User> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

    try {
      console.log('Sending updateUser request to:', `${this.baseUrl}/users/me`);
      console.log('Request data:', data);
      const response = await fetch(`${this.baseUrl}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('updateUser response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('updateUser error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || 'Failed to update user' };
        }
        throw new Error(error.detail || error.message || 'Failed to update user');
      }

      const result = await response.json();
      console.log('updateUser success:', result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('updateUser error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the server may be slow or unavailable. Please try again.');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server to update your profile.');
      }
      throw error;
    }
  }

  async addUserPhoto(photoUrl: string, displayOrder: number = 0): Promise<any> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/users/me/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ photo_url: photoUrl, display_order: displayOrder }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to add photo' }));
        throw new Error(error.detail || 'Failed to add photo');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async deleteUserPhoto(photoId: number): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/users/me/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to delete photo' }));
        throw new Error(error.detail || 'Failed to delete photo');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async completeProfile(isDiscoverable: boolean): Promise<User> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

    try {
      console.log('Sending completeProfile request to:', `${this.baseUrl}/users/me/complete-profile`);
      console.log('Request data:', { is_discoverable: isDiscoverable });
      const response = await fetch(`${this.baseUrl}/users/me/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_discoverable: isDiscoverable }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('completeProfile response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('completeProfile error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || 'Failed to complete profile' };
        }
        throw new Error(error.detail || error.message || 'Failed to complete profile');
      }

      const result = await response.json();
      console.log('completeProfile success:', result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('completeProfile error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the server may be slow or unavailable. Please try again.');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server to complete your profile.');
      }
      throw error;
    }
  }

  // Events
  async getEvents(params?: { sport_id?: number; location?: string; search?: string }): Promise<Event[]> {
    await delay(300);
    let events = [...this.localEvents];
    
    if (params?.sport_id) {
      events = events.filter(e => e.sport_id === params.sport_id);
    }
    if (params?.location) {
      events = events.filter(e => e.location.toLowerCase().includes(params.location!.toLowerCase()));
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(search) ||
        e.description?.toLowerCase().includes(search) ||
        e.location.toLowerCase().includes(search) ||
        e.sport?.name.toLowerCase().includes(search)
      );
    }
    
    return events;
  }

  async getEvent(eventId: number): Promise<Event> {
    await delay(200);
    const event = this.localEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async createEvent(data: any): Promise<Event> {
    await delay(300);
    const newEvent: Event = {
      id: this.localEvents.length + 1,
      ...data,
      participant_count: 0,
      is_cancelled: false,
      created_at: new Date().toISOString(),
      updated_at: null,
      sport: mockSports.find(s => s.id === data.sport_id),
      host: currentUser,
      participants: [],
    };
    this.localEvents.push(newEvent);
    return newEvent;
  }

  async updateEvent(eventId: number, data: any): Promise<Event> {
    await delay(300);
    const event = this.localEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    Object.assign(event, data, { updated_at: new Date().toISOString() });
    return event;
  }

  async rsvpEvent(eventId: number): Promise<Event> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to RSVP' }));
        throw new Error(error.detail || 'Failed to RSVP');
      }

      const event = await response.json();
      this.rsvpEvents.add(eventId);
      return event;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async cancelRsvp(eventId: number): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to cancel RSVP');
      }

      this.rsvpEvents.delete(eventId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  // Event Admin Methods
  async getEventRSVPs(eventId: number): Promise<{ approved: User[]; pending: User[]; rejected: User[] }> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch RSVPs');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async approveRSVP(eventId: number, userId: number): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvps/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to approve RSVP' }));
        throw new Error(error.detail || 'Failed to approve RSVP');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async rejectRSVP(eventId: number, userId: number): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvps/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to reject RSVP' }));
        throw new Error(error.detail || 'Failed to reject RSVP');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  // Buddies
  async getSuggestedBuddies(limit = 10, minScore = 30, offset = 0): Promise<any[]> {
    await delay(300);
    return mockSuggestedBuddies.slice(offset, offset + limit);
  }

  async getBuddies(status?: string): Promise<Buddy[]> {
    await delay(200);
    if (status) {
      return this.localBuddies.filter(m => m.status === status);
    }
    return this.localBuddies;
  }

  async createBuddy(user2Id: number, message?: string): Promise<Buddy> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/buddies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user2_id: user2Id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to create buddy request' }));
        throw new Error(error.detail || 'Failed to create buddy request');
      }

      const buddy = await response.json();

      // If message provided, send it after creating the buddy
      if (message && buddy.id) {
        try {
          await this.sendMessage({
            content: message,
            receiver_id: user2Id,
          });
        } catch (error) {
          console.warn('Failed to send initial message, but buddy request was created:', error);
        }
      }

      return buddy;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  async updateBuddy(buddyId: number, status: 'accepted' | 'rejected'): Promise<Buddy> {
    await delay(300);
    const buddy = this.localBuddies.find(m => m.id === buddyId);
    if (!buddy) throw new Error('Buddy not found');
    buddy.status = status;
    return buddy;
  }

  async deleteBuddy(buddyId: number): Promise<void> {
    await delay(300);
    const index = this.localBuddies.findIndex(m => m.id === buddyId);
    if (index > -1) {
      this.localBuddies.splice(index, 1);
    }
  }

  // Messages
  async getConversations(): Promise<Conversation[]> {
    await delay(300);
    return mockConversations;
  }

  async getConversation(conversationId: number, type: 'user' | 'event' | 'group' = 'user'): Promise<Message[]> {
    await delay(200);
    if (type === 'user') {
      return this.localMessages.filter(m => 
        (m.receiver_id === conversationId && m.sender_id === currentUser.id) ||
        (m.sender_id === conversationId && m.receiver_id === currentUser.id)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (type === 'event') {
      return this.localMessages.filter(m => m.event_id === conversationId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (type === 'group') {
      return this.localMessages.filter(m => m.group_id === conversationId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return [];
  }

  async sendMessage(data: { content: string; receiver_id?: number; event_id?: number; group_id?: number }): Promise<Message> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to send message' }));
        throw new Error(error.detail || 'Failed to send message');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  }

  // Group Chats
  async getGroups(): Promise<GroupChat[]> {
    await delay(200);
    return mockGroupChats;
  }

  async getGroup(groupId: number): Promise<GroupChat> {
    await delay(200);
    const group = mockGroupChats.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    return group;
  }

  async createGroup(data: { name: string; description?: string; member_ids: number[] }): Promise<GroupChat> {
    await delay(300);
    const newGroup: GroupChat = {
      id: mockGroupChats.length + 1,
      name: data.name,
      description: data.description || null,
      avatar_url: `https://picsum.photos/seed/group${mockGroupChats.length + 1}/400/400`,
      created_by_id: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: null,
      members: [
        { id: currentUser.id, full_name: currentUser.full_name, avatar_url: currentUser.avatar_url, is_admin: true },
        ...data.member_ids.map(id => {
          const user = mockUsers.find(u => u.id === id);
          return user ? { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url, is_admin: false } : null;
        }).filter((m): m is GroupMember => m !== null),
      ],
      created_by: { id: currentUser.id, full_name: currentUser.full_name, avatar_url: currentUser.avatar_url, is_admin: true },
    };
    mockGroupChats.push(newGroup);
    return newGroup;
  }

  async updateGroup(groupId: number, data: { name?: string; description?: string; avatar_url?: string }): Promise<GroupChat> {
    await delay(300);
    const group = mockGroupChats.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    Object.assign(group, data, { updated_at: new Date().toISOString() });
    return group;
  }

  async addGroupMembers(groupId: number, user_ids: number[]): Promise<void> {
    await delay(300);
    const group = mockGroupChats.find(g => g.id === groupId);
    if (group) {
      if (!group.members) {
        group.members = [];
      }
      user_ids.forEach(id => {
        const user = mockUsers.find(u => u.id === id);
        if (user && !group.members!.some(m => m.id === id)) {
          group.members!.push({ id: user.id, full_name: user.full_name, avatar_url: user.avatar_url, is_admin: false });
        }
      });
    }
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    await delay(300);
    const group = mockGroupChats.find(g => g.id === groupId);
    if (group && group.members) {
      const index = group.members.findIndex(m => m.id === userId);
      if (index > -1) {
        group.members.splice(index, 1);
      }
    }
  }

  async leaveGroup(groupId: number): Promise<void> {
    await delay(300);
    const group = mockGroupChats.find(g => g.id === groupId);
    if (group && group.members) {
      const index = group.members.findIndex(m => m.id === currentUser.id);
      if (index > -1) {
        group.members.splice(index, 1);
      }
    }
  }

  // Sports & Goals
  async getSports(): Promise<Sport[]> {
    // Try to fetch from API first, fallback to mock data
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.baseUrl}/sports`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout for sports');
      } else if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        console.warn('Backend not available for sports, returning empty array');
        return [];
      } else {
        console.warn('Failed to fetch sports:', error);
      }
    }
    // Return empty array instead of mock data
    return [];
  }

  async getGoals(): Promise<Goal[]> {
    // Try to fetch from API first, fallback to mock data
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.baseUrl}/goals`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout for goals');
      } else if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        console.warn('Backend not available for goals, returning empty array');
        return [];
      } else {
        console.warn('Failed to fetch goals:', error);
      }
    }
    // Return empty array instead of mock data
    return [];
  }

  // Waitlist
  async addToWaitlist(data: {
    email: string;
    name?: string;
    city?: string;
    message?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to add to waitlist' }));
      throw new Error(error.detail || 'Failed to add to waitlist');
    }

    return response.json();
  }

  // Posts
  async getPosts(userId?: number, limit = 20, offset = 0): Promise<Post[]> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(`${this.baseUrl}/posts?${params}`, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to fetch posts');
        console.error('getPosts error response:', errorText);
        throw new Error(errorText || 'Failed to fetch posts');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        // Backend is not running - return empty array instead of throwing
        // This allows the UI to still render with empty data
        console.warn('Backend not available, returning empty data:', this.baseUrl);
        return [];
      }
      console.error('getPosts error:', error);
      throw error;
    }
  }

  async createPost(data: { content: string; image_url?: string }): Promise<Post> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create post' }));
      throw new Error(error.detail || 'Failed to create post');
    }

    return response.json();
  }

  async likePost(postId: number): Promise<Post> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }

    return response.json();
  }

  async deletePost(postId: number): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  }

  // User Events
  async getMyEvents(): Promise<{ owned: Event[]; attending: Event[]; attended: Event[] }> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(`${this.baseUrl}/events/user/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to fetch user events');
        console.error('getMyEvents error:', errorText);
        throw new Error(errorText || 'Failed to fetch user events');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        // Backend is not running - return empty events object instead of throwing
        // This allows the UI to still render with empty data
        console.warn('Backend not available, returning empty events:', this.baseUrl);
        return { owned: [], attending: [], attended: [] };
      }
      console.error('getMyEvents error:', error);
      throw error;
    }
  }
}

export const api = new ApiClient();

