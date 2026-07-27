import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/categories");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error("Failed to load category list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">🏷️ Categories & Tags Management</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor post densities, categorize contents, and identify trending tag subjects.</p>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-3xl">
            No category tags logged on platform posts.
          </div>
        ) : (
          categories.map((cat, idx) => (
            <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20">
                  Topic Tag
                </span>
                <h3 className="text-base font-black text-white mt-2 capitalize">{cat._id || "Uncategorized"}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">{cat.count} published posts</span>
                <span className="text-[10px] text-slate-500">
                  Last: {cat.latestPost ? new Date(cat.latestPost).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
