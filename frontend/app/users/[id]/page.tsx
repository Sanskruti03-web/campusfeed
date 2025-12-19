"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, MapPin, Calendar, FileText, MessageSquare, Edit } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { format } from 'date-fns';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  bio?: string;
  branch?: string;
  year?: string;
  created_at: string;
  stats?: {
    posts: number;
    comments: number;
  };
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', branch: '', year: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = Number(id);

        // Fetch user data
        try {
          const userRes = await usersAPI.get(userId);
          setProfile(userRes.data);
          setEditForm({
            bio: userRes.data.bio || '',
            branch: userRes.data.branch || '',
            year: userRes.data.year || ''
          });
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setLoading(false);
          return; // Stop if user load fails
        }

        // Fetch posts separately - if this fails we still show profile
        try {
          const postsRes = await usersAPI.getPosts(userId);
          setPosts(postsRes.data.posts || []);
        } catch (err) {
          console.error('Failed to fetch user posts:', err);
        }

      } catch (error) {
        console.error('Unexpected error in profile fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await usersAPI.update(editForm);
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-highlight)]"></div>
    </div>
  );

  if (!profile) return <div className="text-center py-20 text-[var(--color-text-muted)]">User not found.</div>;

  const isOwnProfile = currentUser?.id === Number(id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Profile Header Card */}
      <div className="relative mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-highlight)]/10 to-[var(--color-highlight-alt)]/10 rounded-[2.5rem] transform -rotate-1 scale-[1.02]" />
        <div className="relative bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-visible">

          <div className="absolute -top-16 left-1/2 md:left-12 transform -translate-x-1/2 md:translate-x-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-highlight-alt)] flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-8 ring-[var(--color-bg-deep)]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-[var(--color-bg-deep)] rounded-full" title="Online" />
            </div>
          </div>

          <div className="mt-16 md:mt-2 md:ml-40 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)]">
                  {profile.name}
                </h1>
                <p className="text-[var(--color-text-muted)] text-lg font-medium">{profile.email}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="group flex items-center gap-2 px-6 py-3 bg-[var(--color-surface-soft)] hover:bg-[var(--color-highlight)] hover:text-white rounded-2xl transition-all font-bold shadow-sm"
                >
                  <Edit size={18} className="group-hover:scale-110 transition-transform" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="mt-8 space-y-6">
                {profile.bio && (
                  <p className="text-[var(--color-text)] text-lg leading-relaxed max-w-2xl font-medium">
                    "{profile.bio}"
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  {profile.branch && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)]">
                      <GraduationCap size={18} className="text-[var(--color-highlight)]" />
                      {profile.branch}
                    </div>
                  )}
                  {profile.year && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)]">
                      <Calendar size={18} className="text-[var(--color-highlight-alt)]" />
                      Class of {profile.year}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)]">
                    <MapPin size={18} className="text-red-400" />
                    Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-8 pt-8 mt-2 border-t border-[var(--color-border)]">
                  <div className="text-center md:text-left">
                    <span className="block text-3xl font-extrabold font-outfit text-[var(--color-text)] mb-1">
                      {profile.stats?.posts || 0}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Posts</span>
                  </div>
                  <div className="w-px bg-[var(--color-border)]" />
                  <div className="text-center md:text-left">
                    <span className="block text-3xl font-extrabold font-outfit text-[var(--color-text)] mb-1">
                      {profile.stats?.comments || 0}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Comments</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-[var(--color-bg-deep)] rounded-3xl border-2 border-[var(--color-border)] animate-in zoom-in-95 duration-200">
                <div className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2 ml-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] transition-all resize-none font-medium"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2 ml-1">Branch</label>
                      <input
                        type="text"
                        value={editForm.branch}
                        onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                        className="w-full bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] transition-all font-medium"
                        placeholder="e.g. CSE"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2 ml-1">Class Year</label>
                      <input
                        type="text"
                        value={editForm.year}
                        onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                        className="w-full bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] transition-all font-medium"
                        placeholder="e.g. 2025"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleUpdate}
                      className="px-8 py-3 bg-[var(--color-highlight)] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[var(--color-highlight)]/30 hover:scale-105 transition-all"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-bold font-outfit flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-highlight)]">
              <FileText size={24} />
            </div>
            Recent Activitiy
          </h2>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {posts.map(post => (
              <div key={post.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-[2.5rem] text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No posts yet</h3>
            <p className="text-[var(--color-text-muted)] max-w-sm">
              This user hasn't posted anything on CampusFeed properly yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
