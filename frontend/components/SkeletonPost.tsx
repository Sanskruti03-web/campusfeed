export default function SkeletonPost() {
    return (
        <div className="card-frame animate-pulse">
            <div className="card-inner p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-soft)]"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-[var(--color-surface-soft)] rounded w-24 mb-2"></div>
                        <div className="h-3 bg-[var(--color-surface-soft)] rounded w-16"></div>
                    </div>
                </div>
                <div className="h-6 bg-[var(--color-surface-soft)] rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-6">
                    <div className="h-4 bg-[var(--color-surface-soft)] rounded w-full"></div>
                    <div className="h-4 bg-[var(--color-surface-soft)] rounded w-full"></div>
                    <div className="h-4 bg-[var(--color-surface-soft)] rounded w-2/3"></div>
                </div>
                <div className="h-48 bg-[var(--color-surface-soft)] rounded-xl mb-4"></div>
                <div className="flex gap-4">
                    <div className="h-8 bg-[var(--color-surface-soft)] rounded-full w-16"></div>
                    <div className="h-8 bg-[var(--color-surface-soft)] rounded-full w-16"></div>
                </div>
            </div>
        </div>
    );
}
