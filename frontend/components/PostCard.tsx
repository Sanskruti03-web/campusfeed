"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type Post = {
  id: number;
  title: string;
  category: string;
  user_id: number;
  user_name: string;
  created_at: string;
  edited_at?: string;
  cover_url?: string;
  coverUrl?: string;
  media?: { url: string }[];
  content?: string;
  body?: string;
};

export default function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  let coverUrl = post.cover_url || post.coverUrl || (post.media && post.media[0] && post.media[0].url) || undefined;
  if (coverUrl && !coverUrl.startsWith('http')) {
    coverUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${coverUrl}`;
  }
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="card-frame cursor-pointer">
        <div className="card-inner group">
          {coverUrl ? (
            <>
              {/* Image Section */}
              <div className="relative w-full overflow-hidden rounded-t-[1 rem]">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-[#5E558A33] animate-pulse" />
                )}
                <img
                  src={coverUrl}
                  alt={post.title || "Post image"}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  className={`w-full h-auto object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="category-pill hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/?category=${encodeURIComponent(post.category)}`);
                    }}
                  >
                    {post.category}
                  </button>
                  {post.edited_at && (
                    <span className="category-pill opacity-80">edited</span>
                  )}
                </div>
              </div>
              
              {/* Text Section */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold gradient-text-primary line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] tracking-wide text-muted">
                  <button
                    type="button"
                    className="hover:text-[var(--color-highlight)] font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/users/${post.user_id}`);
                    }}
                  >
                    {post.user_name}
                  </button>
                  <span className="opacity-40">•</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-5">
              <button
                type="button"
                className="category-pill mb-3 inline-block hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/?category=${encodeURIComponent(post.category)}`);
                }}
              >
                {post.category}
              </button>
              <h3 className="text-lg font-semibold gradient-text-primary mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-muted line-clamp-4 whitespace-pre-wrap">{post.content || post.body || ''}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted">
                <button
                  type="button"
                  className="hover:text-[var(--color-highlight)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/users/${post.user_id}`);
                  }}
                >
                  {post.user_name}
                </button>
                <span className="opacity-40">•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

