import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-4xl font-bold gradient-text-primary mb-4">Page Not Found</h2>
            <p className="text-[var(--color-text-muted)] mb-8">Could not find the requested resource.</p>
            <Link href="/" className="neo-btn bg-[var(--color-highlight)] text-white">
                Return Home
            </Link>
        </div>
    );
}
