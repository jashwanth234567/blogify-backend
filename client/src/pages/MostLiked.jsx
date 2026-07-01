import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MostLiked = () => {
  const { token } = useAppContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMostLiked = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/posts/most-liked", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load top liked posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMostLiked();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-3xl mb-2">❤️</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Most Liked</h1>
          <p className="text-slate-500 dark:text-slate-450 text-sm max-w-md">Top articles with the highest user appreciation and likes.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No liked posts found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <a
                href={`/blog/${blog._id}`}
                key={blog._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block mb-1.5">{blog.category}</span>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-150 leading-snug mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">{blog.title}</h3>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-2">
                    <img src={blog.author?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50"} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium">@{blog.author?.username || "user"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-xl">
                    <span>❤️ {blog.likes} Likes</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MostLiked;
