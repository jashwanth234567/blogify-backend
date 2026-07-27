/**
 * Skeletons.jsx — Reusable skeleton loading components for all major UI sections.
 * These maintain the dark/light theme by using Tailwind's bg-slate-* tokens.
 */

const shimmer = "animate-pulse";

// ──────────────────────────────────────────
// 1. Blog Card Skeleton (used in BlogList)
// ──────────────────────────────────────────
export const BlogCardSkeleton = () => (
    <div className={`${shimmer} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm`}>
        {/* Thumbnail */}
        <div className="h-48 bg-slate-200 dark:bg-slate-800 w-full" />
        <div className="p-5 space-y-3">
            {/* Category pill */}
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            {/* Title */}
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/5" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/5" />
            {/* Excerpt */}
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            {/* Author row */}
            <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/5" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
            </div>
        </div>
    </div>
);

// ──────────────────────────────────────────
// 2. Blog List Grid Skeleton (4 cards)
// ──────────────────────────────────────────
export const BlogListSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <BlogCardSkeleton key={i} />
        ))}
    </div>
);

// ──────────────────────────────────────────
// 3. Profile Page Skeleton
// ──────────────────────────────────────────
export const ProfileSkeleton = () => (
    <div className={`${shimmer} max-w-4xl mx-auto`}>
        {/* Banner */}
        <div className="h-48 sm:h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-0" />
        <div className="px-4 sm:px-8 -mt-16 flex items-end gap-5">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-950 flex-shrink-0" />
            <div className="pb-4 flex-1 space-y-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
        </div>
        <div className="px-4 sm:px-8 mt-5 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
            {/* Stats row */}
            <div className="flex gap-6 pt-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-1 text-center">
                        <div className="h-5 w-10 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                        <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ──────────────────────────────────────────
// 4. Notification Row Skeleton
// ──────────────────────────────────────────
export const NotificationSkeleton = ({ count = 5 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`${shimmer} flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl`}
            >
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

// ──────────────────────────────────────────
// 5. User Row Skeleton (for followers modal, search results)
// ──────────────────────────────────────────
export const UserRowSkeleton = ({ count = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`${shimmer} flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl`}
            >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/5" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
                <div className="w-20 h-7 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
        ))}
    </div>
);

// ──────────────────────────────────────────
// 6. Stat Card Skeleton (Admin Dashboard)
// ──────────────────────────────────────────
export const StatCardSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`${shimmer} h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl`}
            />
        ))}
    </div>
);

// ──────────────────────────────────────────
// 7. Explore Page Block Skeleton
// ──────────────────────────────────────────
export const ExploreCardSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`${shimmer} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden`}
            >
                <div className="h-36 bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

// ──────────────────────────────────────────
// 8. Full Page Spinner (for Suspense fallback)
// ──────────────────────────────────────────
export const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-600/30 border-t-violet-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider animate-pulse">
            Loading Blogify...
        </p>
    </div>
);
