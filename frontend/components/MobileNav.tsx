"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                    {/* <span className="text-[10px] font-medium">Home</span> */}
                </Link>

                <Link
                    href="/search"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/search') ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
                </Link>

                <Link
                    href="/posts/create"
                    className="flex flex-col items-center justify-center w-full h-full"
                >
                    <div className="w-12 h-12 bg-[var(--color-highlight)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[var(--color-highlight)]/30 transform hover:scale-105 transition-transform">
                        <PlusSquare size={24} strokeWidth={2.5} />
                    </div>
                </Link>

                <Link
                    href="/notifications"
                    className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/notifications') ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <Bell size={24} strokeWidth={isActive('/notifications') ? 2.5 : 2} />
                    {/* We can add a badge here later */}
                </Link>

                <Link
                    href={user ? `/users/${user.id}` : '/auth/login'}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(user ? `/users/${user.id}` : '/auth/login') ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <User size={24} strokeWidth={isActive(user ? `/users/${user.id}` : '/auth/login') ? 2.5 : 2} />
                </Link>
            </div>
        </div>
    );
}
