import { motion } from "framer-motion";

export const BlogCardSkeleton = () => {
  return (
    <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-sm p-5 space-y-4">
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="aspect-[16/9] w-full rounded-2xl bg-slate-200 dark:bg-slate-800"
      />
      <div className="space-y-2">
        <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};

export const AuthorSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-3 p-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-1">
          <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
      <div className="h-7 w-16 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
  );
};

export default BlogCardSkeleton;
