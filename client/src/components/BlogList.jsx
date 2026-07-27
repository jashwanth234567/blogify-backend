import { useState, useEffect } from "react";
import { blogCategories } from "../assets/assets";
import BlogCard from "./BlogCard";
import { useAppContext } from "../context/AppContext";

const BlogList = () => {
    const [menu, setMenu] = useState("All");
    const [feedTab, setFeedTab] = useState("latest"); // Feature 4: 'latest', 'friends', 'recommended', 'trending'
    const { blogs, input, fetchBlogs } = useAppContext();

    // Fetch blogs when feedTab or menu changes
    useEffect(() => {
        fetchBlogs(feedTab, menu);
    }, [feedTab, menu]);

    // Feature 4: Automatic feed refresh via polling
    useEffect(() => {
        const timer = setInterval(() => {
            fetchBlogs(feedTab, menu);
        }, 30000); // refresh every 30s
        return () => clearInterval(timer);
    }, [feedTab, menu]);

    const filteredBlogs = () => {
        if (!input || input === "") {
            return blogs;
        }
        return blogs.filter((blog) =>
            blog.title?.toLowerCase().includes(input.toLowerCase()) ||
            blog.category?.toLowerCase().includes(input.toLowerCase()) ||
            blog.subTitle?.toLowerCase().includes(input.toLowerCase())
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 relative px-2">
                {blogCategories.map((item) => (
                    <button
                        key={item}
                        onClick={() => setMenu(item)}
                        className={`cursor-pointer px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 ${
                            menu === item
                                ? "text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
                                : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-24">
                {blogs.length === 0 ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse bg-white/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 w-full">
                            <div className="w-full h-[220px] bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl mb-5"></div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-slate-200/60 dark:bg-slate-800/60"></div>
                                <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/4"></div>
                            </div>
                            <div className="h-7 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl mb-3 w-5/6"></div>
                            <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md mb-2 w-full"></div>
                            <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md mb-5 w-4/5"></div>
                        </div>
                    ))
                ) : (
                    filteredBlogs()
                        .filter((blog) => (menu === "All" ? true : blog.category === menu))
                        .map((blog) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))
                )}
            </div>
        </div>
    );
};

export default BlogList;

