'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Post } from '@/types';
import { useAuth } from '@/lib/auth';

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ onPostCreated, onCancel }: CreatePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const newPost = await api.createPost({
        content: content.trim(),
        image_url: imageUrl.trim() || undefined,
      });
      onPostCreated(newPost);
      setContent('');
      setImageUrl('');
      if (onCancel) {
        onCancel();
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#0ef9b4] flex items-center justify-center flex-shrink-0">
          <span className="text-black font-semibold">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0ef9b4] focus:border-transparent"
            rows={4}
            disabled={posting}
          />
        </div>
      </div>

      <div className="mb-3">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ef9b4] focus:border-transparent"
          disabled={posting}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={posting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={posting || !content.trim()}
          className="px-6 py-2 bg-[#0ef9b4] text-black rounded-lg font-semibold hover:bg-[#0dd9a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
