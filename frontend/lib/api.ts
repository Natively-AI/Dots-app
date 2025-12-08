import { Event, Sport, User, Match, GroupChat, Conversation, Goal } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, fullName: string): Promise<{ access_token: string; token_type: string }> {
    return this.request<{ access_token: string; token_type: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Users
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(data: any): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Events
  async getEvents(params?: { sport_id?: number; location?: string; search?: string }): Promise<Event[]> {
    const query = new URLSearchParams();
    if (params?.sport_id) query.append('sport_id', params.sport_id.toString());
    if (params?.location) query.append('location', params.location);
    if (params?.search) query.append('search', params.search);
    
    return this.request<Event[]>(`/events?${query.toString()}`);
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.request<Event>(`/events/${eventId}`);
  }

  async createEvent(data: any): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: number, data: any): Promise<Event> {
    return this.request<Event>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async rsvpEvent(eventId: number): Promise<void> {
    return this.request<void>(`/events/${eventId}/rsvp`, {
      method: 'POST',
    });
  }

  async cancelRsvp(eventId: number): Promise<void> {
    return this.request<void>(`/events/${eventId}/rsvp`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getSuggestedMatches(limit = 10, minScore = 30, offset = 0): Promise<any[]> {
    return this.request<any[]>(`/matches/suggested?limit=${limit}&min_score=${minScore}&offset=${offset}`);
  }

  async getMatches(status?: string): Promise<Match[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Match[]>(`/matches${query}`);
  }

  async createMatch(user2Id: number): Promise<Match> {
    return this.request<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify({ user2_id: user2Id }),
    });
  }

  async updateMatch(matchId: number, status: 'accepted' | 'rejected'): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteMatch(matchId: number): Promise<void> {
    return this.request<void>(`/matches/${matchId}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/messages/conversations');
  }

  async getConversation(conversationId: number, type: 'user' | 'event' | 'group' = 'user'): Promise<any[]> {
    return this.request<any[]>(`/messages/conversations/${conversationId}?conversation_type=${type}`);
  }

  async sendMessage(data: { content: string; receiver_id?: number; event_id?: number; group_id?: number }): Promise<any> {
    return this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Group Chats
  async getGroups(): Promise<GroupChat[]> {
    return this.request<GroupChat[]>('/groups');
  }

  async getGroup(groupId: number): Promise<GroupChat> {
    return this.request<GroupChat>(`/groups/${groupId}`);
  }

  async createGroup(data: { name: string; description?: string; member_ids: number[] }): Promise<GroupChat> {
    return this.request<GroupChat>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(groupId: number, data: { name?: string; description?: string; avatar_url?: string }): Promise<GroupChat> {
    return this.request<GroupChat>(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addGroupMembers(groupId: number, user_ids: number[]): Promise<void> {
    return this.request<void>(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_ids }),
    });
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    return this.request<void>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async leaveGroup(groupId: number): Promise<void> {
    return this.request<void>(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  // Sports & Goals
  async getSports(): Promise<Sport[]> {
    return this.request<Sport[]>('/sports');
  }

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/goals');
  }
}

export const api = new ApiClient();

