'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postsAPI, mediaAPI } from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = ['Events', 'Announcements', 'Lost&Found', 'General'];

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content_md: '',
    category: 'General',
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024;

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
      const response = await postsAPI.create(formData);
      const postId = response.data.id;

      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        const uploadPromises = selectedFiles.map(file => mediaAPI.upload(file, postId));
        await Promise.all(uploadPromises);
      }

      router.push(`/posts/${postId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-deep">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold gradient-text-primary">Create Post</h1>
          <Link href="/" className="neo-btn">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="card-frame mb-6">
            <div className="card-inner">
              <div className="p-4 bg-red-50 text-red-700 rounded-xl font-medium">
                {error}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-frame">
            <div className="card-inner p-6">
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="neo-input w-full px-5 py-3"
                placeholder="Enter post title..."
                maxLength={200}
              />
              <p className="mt-2 text-xs text-muted">
                {formData.title.length}/200 characters
              </p>
            </div>
          </div>

          <div className="card-frame">
            <div className="card-inner p-6">
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="neo-input w-full px-5 py-3 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-frame">
            <div className="card-inner p-6">
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                Content (Markdown supported)
              </label>
              <textarea
                required
                value={formData.content_md}
                onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                className="neo-input w-full px-5 py-4 font-mono text-sm resize-none"
                placeholder="Write your post content here... Markdown is supported!"
                rows={14}
              />
              <p className="mt-3 text-xs text-muted">
                Supports markdown: **bold**, *italic*, [links](url), lists, code blocks, etc.
              </p>
            </div>
          </div>

          <div className="card-frame">
            <div className="card-inner p-6">
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-4">
                Attachments
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
                    Selected Files ({selectedFiles.length})
                  </p>
                  <p className="text-xs text-muted mb-3">
                    Files will be uploaded after creating the post
                  </p>
                  <div className="space-y-3">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[var(--color-bg-deep)] rounded-xl border border-[rgba(124,111,198,0.08)]">
                        <div className="flex items-center space-x-4">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[var(--color-surface)] rounded-lg flex items-center justify-center">
                              <span className="text-xs text-muted font-semibold">PDF</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{file.name}</p>
                            <p className="text-xs text-muted">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
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

          <div className="flex justify-end space-x-4 pt-2">
            <Link href="/" className="neo-btn px-6">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="neo-btn bg-[var(--color-highlight)] text-white hover:opacity-90 disabled:opacity-50 px-8 font-semibold"
            >
              {loading ? 'Creating...' : uploadingFiles ? 'Uploading...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
