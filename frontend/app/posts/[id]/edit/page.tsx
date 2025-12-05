'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { postsAPI, mediaAPI, authAPI } from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = ['Academics', 'Events', 'Clubs', 'Sports', 'Placements', 'General', 'Announcements', 'Food', 'Housing'];

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content_md: '',
    category: 'General',
  });
  
  const [existingMedia, setExistingMedia] = useState<{ id: number; url: string; type: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Fetch post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Get current user first
        const userRes = await authAPI.me();
        const currentUserId = userRes.data.id;
        setUserId(currentUserId);

        const response = await postsAPI.get(postId);
        const post = response.data;

        // Check if user owns this post
        if (post.user_id !== currentUserId) {
          setError('You do not have permission to edit this post');
          setFetching(false);
          return;
        }

        setFormData({
          title: post.title,
          content_md: post.content_md,
          category: post.category,
        });
        setExistingMedia(post.media || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/auth/login');
        } else {
          setError(err.response?.data?.error || 'Failed to load post');
        }
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setError(`File ${file.name} has invalid type. Allowed: PNG, JPEG, WebP, PDF`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Update the post
      await postsAPI.update(postId, formData);

      // Step 2: Upload new media files if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        const uploadPromises = selectedFiles.map(file => mediaAPI.upload(file, postId));
        await Promise.all(uploadPromises);
      }

      // Step 3: Redirect back to the post
      router.push(`/posts/${postId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update post');
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card-frame animate-pulse">
            <div className="card-inner">
              <div className="h-8 bg-[var(--color-surface-soft)] rounded w-1/4 mb-6"></div>
              <div className="h-10 bg-[var(--color-surface-soft)] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold gradient-text-primary">Edit Post</h1>
          <Link href={`/posts/${postId}`} className="text-muted hover:text-[var(--color-text)] transition-colors">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="card-frame mb-6">
            <div className="card-inner bg-red-50 text-red-700">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-frame">
            <div className="card-inner">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="neo-input w-full"
                placeholder="Enter post title..."
                maxLength={200}
              />
              <p className="mt-2 text-xs text-muted">
                {formData.title.length}/200 characters
              </p>
            </div>
          </div>

          <div className="card-frame">
            <div className="card-inner">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="neo-input w-full"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-frame">
            <div className="card-inner">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Content (Markdown supported)
              </label>
              <textarea
                required
                value={formData.content_md}
                onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                className="neo-input w-full font-mono text-sm"
                placeholder="Write your post content here... Markdown is supported!"
                rows={12}
              />
              <p className="mt-3 text-xs text-muted">
                Supports markdown: **bold**, *italic*, [links](url), lists, code blocks, etc.
              </p>
            </div>
          </div>

          {existingMedia.length > 0 && (
            <div className="card-frame">
              <div className="card-inner">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                  Existing Attachments
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingMedia.map(media => (
                    <div key={media.id} className="relative">
                      {media.type === 'image' ? (
                        <img
                          src={`http://localhost:5000${media.url}`}
                          alt="Attachment"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-[var(--color-surface-soft)] rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-600">PDF</span>
                      </div>
                      >
                        <span className="text-xs text-muted">PDF</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">
                Note: You can add new files but cannot remove existing ones in this version
              </p>
            </div>
          )}

          <div className="card-frame">
            <div className="card-inner">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Add New Attachments
              </label>
              
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center neo-btn cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Select Files
                </label>
                <p className="mt-3 text-xs text-muted">
                  PNG, JPEG, WebP, PDF (max 10MB each)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)] mb-3">
                    New Files ({selectedFiles.length})
                  </p>
                  <p className="text-xs text-muted mb-3">
                    Files will be uploaded when you save changes
                  </p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-surface-soft)] rounded-lg">
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[var(--color-surface-soft)] rounded flex items-center justify-center">
                              <span className="text-xs text-muted">PDF</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                            <p className="text-xs text-muted">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href={`/posts/${postId}`} className="neo-btn">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="neo-btn bg-[var(--color-highlight)] text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : uploadingFiles ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
