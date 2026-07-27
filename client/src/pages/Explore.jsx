import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogCard from "../components/BlogCard";
import { BlogCardSkeleton, AuthorSkeleton } from "../components/SkeletonLoader";
import { useAppContext } from "../context/AppContext";

const popularCategories = ["AI", "Programming", "Technology", "Business", "Design", "Startup", "Lifestyle"];
const trendingTags = ["#ArtificialIntelligence", "#WebDev", "#ReactJS", "#NodeJS", "#UIUX", "#MachineLearning", "#Crypto", "#CleanCode"];

const Explore = () => {
  const { token, navigate, user: currentUser } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState("AI");
  const [blogs, setBlogs] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch category blogs & trending blogs & suggested authors
  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const [catRes, trendRes, userRes] = await Promise.all([
        axios.get(`/api/blog/all?category=${selectedCategory}&limit=9`),
        axios.get("/api/blog/all?feed=trending&limit=4"),
        axios.get("/api/user/suggested")
      ]);

      if (catRes.data.success) {
        setBlogs(catRes.data.blogs || []);
      }
      if (trendRes.data.success) {
        setTrendingPosts(trendRes.data.blogs?.slice(0, 4) || []);
      }

      const usersList = userRes.data?.users || (Array.isArray(userRes.data) ? userRes.data : []);
      setSuggestedUsers(usersList.filter(u => u._id !== currentUser?._id && u.id !== currentUser?._id).slice(0, 5));
    } catch (error) {
      console.error("Error loading explore page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, [selectedCategory]);

  const handleFollowUser = async (targetUser) => {
    if (!token) {
      toast.error("Please log in to follow users.");
      return;
    }
    try {
      const isFollowing = targetUser.isFollowing;
      const endpoint = `/api/users/${targetUser._id || targetUser.id}/follow`;
      const config = { headers: { Authorization: token } };

      const { data } = isFollowing
        ? await axios.delete(endpoint, config)
        : await axios.post(endpoint, {}, config);

      if (data.success) {
        toast.success(isFollowing ? `Unfollowed @${targetUser.username}` : `Following @${targetUser.username}`);
        setSuggestedUsers(prev =>
          prev.map(u => (u._id === targetUser._id ? { ...u, isFollowing: !isFollowing } : u))
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* Header Hero Banner with Framer Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden bg-gradient-to-r from-violet-900/80 via-indigo-900/80 to-slate-900 border border-violet-500/20 shadow-2xl text-white"
        >
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3.5 py-1 bg-violet-500/30 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-violet-300 mb-3 border border-violet-400/30">
              ✨ Discover What's Next
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 font-heading">
              Explore Trending Stories & Inspiring Authors
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Stay ahead with curated content across AI, Programming, Design, Business, and emerging technologies.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        </motion.div>

        {/* Explore Categories Navigation */}
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Popular Categories</h2>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {popularCategories.map(cat => (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-600/30 shadow-md scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Grid: Left Posts Feed, Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Category Posts */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔥 Top Stories in</span>
              <span className="text-violet-600 dark:text-violet-400">{selectedCategory}</span>
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <BlogCardSkeleton key={idx} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                No posts found in {selectedCategory} yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Dynamic Suggested Authors & Trending Tags */}
          <div className="space-y-8">
            
            {/* Suggested Authors Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Suggested Authors</span>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 cursor-pointer hover:underline">View All</span>
              </h3>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <AuthorSkeleton key={i} />)
                ) : suggestedUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No suggestions available</p>
                ) : (
                  suggestedUsers.map(u => (
                    <div key={u._id || u.id} className="flex items-center justify-between gap-3">
                      <a href={`/profile/${u.username || u._id}`} className="flex items-center gap-3 min-w-0 group">
                        <img
                          src={u.image || u.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover bg-slate-100 flex-shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight group-hover:text-violet-600 transition-colors">{u.name || u.displayName}</p>
                          <p className="text-[11px] text-slate-450 truncate">@{u.username || "author"}</p>
                        </div>
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFollowUser(u)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex-shrink-0 ${
                          u.isFollowing
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:shadow-violet-600/30"
                        }`}
                      >
                        {u.isFollowing ? "Following" : "Follow"}
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Explore;
