import { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import BlogTableItem from "../../components/author/BlogTableItem";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Moment from "moment";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        isAdmin: false,
        blogs: 0,
        comments: 0,
        drafts: 0,
        publishedBlogs: 0,
        aiBlogs: 0,
        totalViews: 0,
        revenue: 0,
        recentBlogs: [],
    });
    const [loading, setLoading] = useState(true);
    const { axios } = useAppContext();

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/user/dashboard");
            if (data.success) {
                setDashboardData(data.dashboardData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="w-10 h-10 rounded-full border-4 border-t-[#7C3AED] animate-spin" />
            </div>
        );
    }

    // Modern SaaS Dashboard View (Combined Admin & Regular layout based on roles, unified styling)
    return (
        <div className="flex-1 p-[32px] md:p-[64px] bg-[rgb(219,218,218)] dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto space-y-[32px] transition-colors duration-300">
            {/* Header */}
            <div className="bz-card flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-[24px] shadow-lg transition-colors duration-300">
                <div>
                    <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-[8px]">
                        Welcome back{dashboardData.isAdmin ? ", Admin" : ", Creator"}
                    </h1>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400">Here is what's happening with your platform today.</p>
                </div>
                <div className="flex gap-[16px]">
                    <button className="bz-btn-primary" style={{height: '48px', padding: '0 24px', borderRadius: '12px'}}>
                        {dashboardData.isAdmin ? "Download Report" : "Write New Blog"}
                    </button>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                <div className="bz-card bz-stat flex flex-col justify-between min-h-[140px] bz-card-interactive shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Views</span>
                    <div className="flex justify-between items-end mt-[16px]">
                        <span className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">{dashboardData.totalViews}</span>
                        <span className="text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-[8px] py-[4px] rounded-full">+12%</span>
                    </div>
                </div>

                <div className="bz-card bz-stat flex flex-col justify-between min-h-[140px] bz-card-interactive shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Published Blogs</span>
                    <div className="flex justify-between items-end mt-[16px]">
                        <span className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">{dashboardData.isAdmin ? dashboardData.totalBlogs : dashboardData.blogs}</span>
                        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{dashboardData.draftBlogs || dashboardData.drafts} Drafts</span>
                    </div>
                </div>

                <div className="bz-card bz-stat flex flex-col justify-between min-h-[140px] bz-card-interactive shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Comments</span>
                    <div className="flex justify-between items-end mt-[16px]">
                        <span className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">{dashboardData.isAdmin ? dashboardData.totalComments : dashboardData.comments}</span>
                        <span className="text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-[8px] py-[4px] rounded-full">Active</span>
                    </div>
                </div>

                <div className="bz-card bz-stat flex flex-col justify-between min-h-[140px] bz-card-interactive shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">AI Generation Usage</span>
                    <div className="flex justify-between items-end mt-[16px]">
                        <span className="text-[32px] font-extrabold text-violet-600 dark:text-violet-400 leading-none">{dashboardData.aiBlogs || 0}</span>
                        <span className="text-[12px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-[8px] py-[4px] rounded-full">Automated</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
                <div className="bz-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-[24px] rounded-[24px]">
                    <h2 className="text-[14px] font-bold text-slate-900 dark:text-white mb-[24px]">Traffic Overview</h2>
                    <div className="h-[250px] w-full bg-[rgb(219,218,218)] dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-[16px] p-[16px] relative flex items-center justify-center transition-colors duration-300">
                        <svg viewBox="0 0 500 150" className="w-full h-full opacity-80">
                            <line x1="0" y1="30" x2="500" y2="30" stroke="var(--color-slate-200, #E2E8F0)" strokeDasharray="4" />
                            <line x1="0" y1="75" x2="500" y2="75" stroke="var(--color-slate-200, #E2E8F0)" strokeDasharray="4" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="var(--color-slate-200, #E2E8F0)" strokeDasharray="4" />
                            <path d="M 0 130 Q 120 90 200 60 T 350 40 T 500 90" fill="none" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className="bz-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-[24px] rounded-[24px]">
                    <h2 className="text-[14px] font-bold text-slate-900 dark:text-white mb-[24px]">AI Usage Matrix</h2>
                    <div className="h-[250px] w-full bg-[rgb(219,218,218)] dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-[16px] p-[16px] relative flex items-center justify-center transition-colors duration-300">
                         <svg viewBox="0 0 500 150" className="w-full h-full opacity-80">
                            <line x1="0" y1="130" x2="500" y2="130" stroke="var(--color-slate-200, #E2E8F0)" strokeWidth="2" />
                            <rect x="40" y="80" width="40" height="50" fill="#7C3AED" rx="4" />
                            <rect x="120" y="50" width="40" height="80" fill="#8B5CF6" rx="4" />
                            <rect x="200" y="30" width="40" height="100" fill="#7C3AED" rx="4" />
                            <rect x="280" y="70" width="40" height="60" fill="#8B5CF6" rx="4" />
                            <rect x="360" y="20" width="40" height="110" fill="#7C3AED" rx="4" />
                         </svg>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Blogs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
                <div className="bz-card lg:col-span-2 overflow-hidden shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-[24px]">
                    <h2 className="text-[14px] font-bold text-slate-900 dark:text-white mb-[24px]">Recent Articles</h2>
                    <div className="bz-table-wrap overflow-hidden">
                        <table className="bz-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Published</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentBlogs?.map((blog) => (
                                    <tr key={blog._id}>
                                        <td className="font-bold text-slate-900 dark:text-white">{blog.title.length > 40 ? blog.title.substring(0, 40) + '...' : blog.title}</td>
                                        <td>{blog.author?.name || "Anonymous"}</td>
                                        <td>{Moment(blog.createdAt).format("MMM DD, YYYY")}</td>
                                        <td>
                                            <span className="text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-[8px] py-[4px] rounded-[6px]">Live</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!dashboardData.recentBlogs || dashboardData.recentBlogs.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-slate-500 dark:text-slate-400 py-[32px]">No recent articles found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bz-card shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-[24px]">
                    <h2 className="text-[14px] font-bold text-slate-900 dark:text-white mb-[24px]">System Notifications</h2>
                    <div className="space-y-[16px]">
                        {dashboardData.isAdmin && dashboardData.recentUsers?.slice(0, 4).map((user) => (
                            <div key={user._id} className="flex gap-[16px] items-start p-[16px] bg-[rgb(219,218,218)] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[16px] transition-colors duration-300">
                                <div className="w-[8px] h-[8px] rounded-full bg-[#7C3AED] mt-[6px]" />
                                <div>
                                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">New user registered</p>
                                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{user.name} ({user.email})</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-[4px]">{Moment(user.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        ))}
                        {(!dashboardData.isAdmin || !dashboardData.recentUsers || dashboardData.recentUsers.length === 0) && (
                            <div className="p-[24px] text-center bg-[rgb(219,218,218)] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[16px] transition-colors duration-300">
                                <p className="text-[13px] text-slate-500 dark:text-slate-400">No recent notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
