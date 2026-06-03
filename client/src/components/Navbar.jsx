import { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
    const { navigate, token, isDarkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead, handleLogout } = useAppContext();
    const [showDropdown, setShowDropdown] = useState(false);
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
        <div className="flex justify-between items-center py-5 sm:py-8 mx-8 sm:mx-20 xl:mx-32 relative">
            <img onClick={() => navigate("/")} src={isDarkMode ? assets.logo_light : assets.logo} alt="logo" className="w-32 sm:w-36 cursor-pointer" />
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? (
                        <svg className="w-5 h-5 fill-amber-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 2.293a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm4 4.707a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM14 15.707a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zm-4 1.293a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-2.293a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm2-4.293a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 fill-slate-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    )}
                </button>

                {/* Notifications Bell Button */}
                {token && (
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
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Animated Notification Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-black/50 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-3 duration-250">
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
                                                className={`flex items-start gap-3 p-4 hover:bg-violet-50/50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50/50 dark:border-slate-800/40 transition-colors duration-200 ${!notification.isRead ? 'bg-violet-50/20 dark:bg-violet-950/5' : ''}`}
                                            >
                                                {/* Category Icons */}
                                                <div className="mt-0.5">
                                                    {notification.type === "registration" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                                                            👤
                                                        </span>
                                                    )}
                                                    {notification.type === "comment" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                                                            💬
                                                        </span>
                                                    )}
                                                    {notification.type === "publication" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                                            ✨
                                                        </span>
                                                    )}
                                                    {notification.type === "approval" && (
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600">
                                                            ✅
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm text-slate-750 dark:text-slate-300 leading-snug ${!notification.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {!notification.isRead && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600 mt-1.5 flex-shrink-0 animate-pulse" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={() => navigate("/author")} className="group flex items-center gap-2 rounded-xl text-sm font-bold cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-2.5 shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    {token ? "Dashboard" : "Login"}
                    <img src={assets.arrow} className="w-3 transition-transform duration-300 group-hover:translate-x-1" alt="arrow" />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
