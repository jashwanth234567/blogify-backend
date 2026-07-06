import { useState, useRef, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/author/Sidebar";
import { useAppContext } from "../../context/AppContext";

const Layout = () => {
    const { navigate, isDarkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead, handleLogout } = useAppContext();
    const [showDropdown, setShowDropdown] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        markNotificationRead(notification._id);
        setShowDropdown(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between py-2 h-[70px] px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md transition-colors duration-300 z-40 relative shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
                <div className="flex items-center gap-3">
                    <img
                        src={isDarkMode ? assets.logo_light : assets.logo}
                        alt="logo"
                        className="w-32 sm:w-36 cursor-pointer"
                        onClick={() => navigate("/")}
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-600/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded">SaaS Pro</span>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5 stroke-amber-500 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v2"></path>
                                <path d="M12 20v2"></path>
                                <path d="m4.93 4.93 1.41 1.41"></path>
                                <path d="m17.66 17.66 1.41 1.41"></path>
                                <path d="M2 12h2"></path>
                                <path d="M20 12h2"></path>
                                <path d="m6.34 17.66-1.41 1.41"></path>
                                <path d="m19.07 4.93-1.41 1.41"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 fill-slate-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    {/* Notifications bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative"
                            aria-label="Notifications"
                        >
                            <svg className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow shadow-violet-500/30 animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown panel */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-black/50 z-50 overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllNotificationsRead}
                                            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`flex items-start gap-3 p-4 hover:bg-violet-50/50 dark:hover:bg-slate-800/60 cursor-pointer border-b border-slate-50 dark:border-slate-800/40 transition-colors duration-200 ${!notification.isRead ? 'bg-violet-50/30 dark:bg-violet-950/10' : ''}`}
                                            >
                                                <div className="mt-0.5">
                                                    {notification.type === "registration" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">👤</span>
                                                    )}
                                                    {notification.type === "comment" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">💬</span>
                                                    )}
                                                    {notification.type === "publication" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">✨</span>
                                                    )}
                                                    {notification.type === "approval" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">✅</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notification.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {!notification.isRead && (
                                                    <span className="h-2 w-2 rounded-full bg-violet-600 mt-2 flex-shrink-0 animate-pulse" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800 p-2.5 text-center">
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate("/notifications");
                                        }}
                                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={handleLogout} className="text-xs px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        Logout
                    </button>
                </div>
            </div>

            {/* Layout body */}
            <div className="flex h-[calc(100vh-70px)] bg-[rgb(219,218,218)] dark:bg-slate-950 overflow-hidden transition-colors duration-300">
                <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
                <div className="flex-1 overflow-y-auto bg-[rgb(219,218,218)] dark:bg-slate-950 relative transition-colors duration-300">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
