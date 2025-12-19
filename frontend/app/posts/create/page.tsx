'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postsAPI, mediaAPI } from '@/lib/api';
import Link from 'next/link';
import { Image as ImageIcon, FileText, X, Eye, Edit3, Send, Upload, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CATEGORIES = ['Events', 'Announcements', 'Lost&Found', 'General', 'Academics', 'Food'];

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');

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
    if (!formData.title.trim() || !formData.content_md.trim()) {
      setError('Please fill in both title and content');
      return;
    }

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
    <div className="min-h-screen py-10 pb-20 bg-[var(--color-bg-deep)] animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium"
          >
            <X size={20} />
            <span>Cancel</span>
          </Link>
          <div className="text-xl font-bold font-outfit text-[var(--color-text)]">New Post</div>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingFiles}
            className="flex items-center gap-2 bg-[var(--color-highlight)] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[var(--color-highlight)]/20 hover:scale-105 hover:shadow-[var(--color-highlight)]/40 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {(loading || uploadingFiles) ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span>Publish</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Main Editor Card */}
          <div className="bg-[var(--color-surface)]/50 backdrop-blur-xl border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-sm">

            {/* Title & Category Inputs */}
            <div className="p-8 pb-4 border-b border-[var(--color-border)]/50 space-y-6">

              <div className="relative group">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter an engaging title..."
                  className="w-full bg-transparent text-4xl font-bold font-outfit text-[var(--color-text)] placeholder-[var(--color-text-muted)]/40 focus:outline-none"
                  autoFocus
                />
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-border)] scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-300 bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-alt)]" />
              </div>

              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
                <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Type size={14} />
                  Category:
                </span>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`
                      px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border
                      ${formData.category === cat
                        ? 'bg-[var(--color-highlight)] border-[var(--color-highlight)] text-white shadow-md shadow-[var(--color-highlight)]/20'
                        : 'bg-[var(--color-surface-soft)] border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 bg-[var(--color-surface-soft)]/50 border-b border-[var(--color-border)]/50 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-1 border border-[var(--color-border)]">
                <button
                  onClick={() => setMode('write')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'write' ? 'bg-[var(--color-surface-soft)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                >
                  <Edit3 size={14} />
                  Write
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'preview' ? 'bg-[var(--color-surface-soft)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                >
                  <Eye size={14} />
                  Preview
                </button>
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)]">
                Markdown Supported
              </div>
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[400px]">
              {mode === 'write' ? (
                <textarea
                  value={formData.content_md}
                  onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                  placeholder="Share your thoughts with the campus... Use markdown for styling."
                  className="w-full h-full min-h-[400px] p-8 bg-transparent text-[var(--color-text)] text-lg leading-relaxed focus:outline-none resize-none font-medium placeholder-[var(--color-text-muted)]/40"
                />
              ) : (
                <div className="w-full h-full min-h-[400px] p-8 prose prose-lg dark:prose-invert max-w-none">
                  {formData.content_md ? (
                    <ReactMarkdown>{formData.content_md}</ReactMarkdown>
                  ) : (
                    <p className="text-[var(--color-text-muted)] italic">Nothing to preview yet...</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer / Attachments */}
            <div className="p-6 bg-[var(--color-surface-soft)]/30 border-t border-[var(--color-border)]">
              <div className="flex flex-col gap-4">

                {/* Upload Button */}
                <div>
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
                    className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-highlight)] hover:text-[var(--color-highlight-alt)] cursor-pointer transition-colors p-2 hover:bg-[var(--color-highlight)]/10 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-[var(--color-highlight)]/10">
                      <Upload size={18} />
                    </div>
                    Attach Images or Documents
                  </label>
                </div>

                {/* File List */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="group relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm aspect-video flex items-center justify-center">
                        <button
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={14} />
                        </button>

                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <FileText size={24} className="mx-auto text-[var(--color-text-muted)] mb-1" />
                            <span className="text-xs font-medium text-[var(--color-text)] block truncate px-2 max-w-[120px]">{file.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
