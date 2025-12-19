"use client";

import { useState } from 'react';
import { usersAPI } from '@/lib/api';
import { MessageSquarePlus, X, Loader2 } from 'lucide-react';

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [type, setType] = useState('feature');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        try {
            await usersAPI.sendFeedback({ content, type });
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setIsOpen(false);
                setContent('');
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] text-[var(--color-text)] p-3 rounded-full shadow-lg border border-[var(--color-border)] transition-transform hover:scale-105"
                title="Send Feedback"
            >
                <MessageSquarePlus size={24} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--color-surface)] w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold font-outfit">Send Feedback</h2>
                            <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                <X size={24} />
                            </button>
                        </div>

                        {sent ? (
                            <div className="text-center py-8 text-green-500 font-medium">
                                Thank you for your feedback!
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Type</label>
                                    <div className="flex gap-2">
                                        {['feature', 'bug', 'other'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${type === t
                                                        ? 'bg-[var(--color-highlight)] text-white'
                                                        : 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Message</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full h-32 bg-[var(--color-bg-deep)] rounded-xl p-3 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none"
                                        placeholder="Describe your idea or issue..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[var(--color-highlight)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={18} />}
                                    Submit Feedback
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
