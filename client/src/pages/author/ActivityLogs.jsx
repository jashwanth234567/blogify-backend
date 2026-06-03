import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Moment from "moment";

const ActivityLogs = () => {
    const { axios, isAdmin } = useAppContext();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/user/activity-logs");
            if (data.success) {
                setLogs(data.logs);
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
        if (isAdmin) {
            fetchLogs();
        }
    }, [isAdmin]);

    // Color codes for different activity actions
    const getActionBadgeClass = (action) => {
        switch (action) {
            case "login":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "logout":
                return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
            case "register":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "blog_create":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "blog_update":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-405";
            case "blog_delete":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
            case "comment_add":
                return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
            case "comment_approve":
                return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
            case "comment_delete":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 bg-[rgb(219,218,218)] text-slate-800 dark:text-slate-200">
                <p className="text-xl font-bold">Access Denied: Admin Only</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-10 bg-[rgb(219,218,218)] overflow-scroll">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Activity Audit Logs</h1>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/25 rounded-xl cursor-pointer transition-all duration-300"
                >
                    Refresh Logs
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin"></div>
                </div>
            ) : (
                <div className="relative max-w-6xl overflow-x-auto border border-transparent dark:border-slate-850 bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-2">
                    <table className="w-full text-sm text-slate-500">
                        <thead className="text-xs text-slate-500 text-left uppercase border-b border-transparent dark:border-slate-800">
                            <tr>
                                <th scope="col" className="px-4 py-4 font-bold text-left">
                                    Time
                                </th>
                                <th scope="col" className="px-4 py-4 font-bold">
                                    User
                                </th>
                                <th scope="col" className="px-4 py-4 font-bold">
                                    Action
                                </th>
                                <th scope="col" className="px-4 py-4 font-bold">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} className="border-b border-slate-250 dark:border-slate-800/40 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800/30 transition-colors duration-205">
                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                        {Moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {log.user ? (
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">{log.user.name}</div>
                                                <div className="text-xs text-slate-400">{log.user.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 dark:text-slate-550 italic">Guest</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                                            {log.action.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-655 dark:text-slate-350 max-w-md break-words font-medium">
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-400">
                                        No activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;
