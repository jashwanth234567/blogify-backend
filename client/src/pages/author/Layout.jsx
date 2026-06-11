import { useState, useRef, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/author/Sidebar";
import { useAppContext } from "../../context/AppContext";

const Layout = () => {
    const { navigate, isDarkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead, handleLogout } = useAppContext();
    const [showDropdown, setShowDropdown] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
        <div 
            className="min-h-screen bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300"
            style={{ 
                paddingLeft: 'env(safe-area-inset-left)', 
                paddingRight: 'env(safe-area-inset-right)',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between py-2 h-[70px] px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827]/90 backdrop-blur-md transition-colors duration-300 z-40 relative shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu (Mobile Only) */}
                    <button 
                        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <img
                        src={isDarkMode ? assets.logo_light : assets.logo}
                        alt="logo"
                        className="w-28 sm:w-36 cursor-pointer hidden sm:block"
                        onClick={() => navigate("/")}
                    />
                    <div 
                        className="sm:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white cursor-pointer shadow-sm"
                        onClick={() => navigate("/")}
                        title="Blogify AI"
                    >
                        <span className="text-sm">✍️</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-600/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded hidden sm:inline-block">SaaS Pro</span>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        )}
                    </button>

                    {/* Notifications bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative"
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
                            </div>
                        )}
                    </div>

                    <button onClick={handleLogout} className="text-xs px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        Logout
                    </button>
                </div>
            </div>

            {/* Layout body */}
            <div className="flex h-[calc(100vh-70px)] bg-transparent dark:bg-slate-950 overflow-hidden transition-colors duration-300 relative">
                {/* Mobile Drawer Overlay */}
                {mobileDrawerOpen && (
                    <div 
                        className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setMobileDrawerOpen(false)}
                    />
                )}
                {/* Sidebar Container */}
                <div className={`
                    fixed md:static inset-y-0 left-0 z-50 h-[calc(100vh-70px)] md:h-auto
                    transform ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                    transition-transform duration-300 ease-in-out
                `}>
                    <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} setMobileDrawerOpen={setMobileDrawerOpen} />
                </div>
                <div className="flex-1 overflow-y-auto bg-transparent dark:bg-slate-950 relative transition-colors duration-300">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
