import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useDebounce } from "../hooks/useDebounce";

const Navbar = () => {
    const { navigate, token, user: currentUser, isDarkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead, handleLogout } = useAppContext();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Live debounced search effect
    useEffect(() => {
        const fetchSearchResults = async () => {
            const queryClean = searchQuery.trim();
            if (!debouncedSearch || queryClean === "") {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            try {
                setIsSearching(true);
                const config = token ? { headers: { Authorization: token } } : {};
                const searchUrl = `/api/users/search?q=${encodeURIComponent(queryClean)}`;
                
                console.log(`[Frontend Search] Fetching: ${searchUrl}`);
                const { data } = await axios.get(searchUrl, config);
                
                // Support both direct array payload and object payload { users: [...] }
                const results = Array.isArray(data) ? data : (data.users || data.data || []);
                console.log(`[Frontend Search] Received ${results.length} results for "${queryClean}"`, results);
                setSearchResults(results);
            } catch (err) {
                console.error("[Frontend Search Error]:", err);
                toast.error("Search failed. Please check network connection.");
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchSearchResults();
    }, [debouncedSearch, token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchModal(false);
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

    const handleFollowToggleInSearch = async (userInSearch, e) => {
        e.stopPropagation();
        if (!token) {
            toast.error("Please log in to follow users.");
            return;
        }
        try {
            const isFollowing = userInSearch.isFollowing;
            const targetId = userInSearch.id || userInSearch._id;
            const endpoint = `/api/users/${targetId}/follow`;
            const config = { headers: { Authorization: token } };

            const { data } = isFollowing
                ? await axios.delete(endpoint, config)
                : await axios.post(endpoint, {}, config);

            if (data.success) {
                toast.success(isFollowing ? `Unfollowed @${userInSearch.username}` : `Following @${userInSearch.username}`);
                setSearchResults(prev =>
                    prev.map(u => (u.id === targetId || u._id === targetId) ? { ...u, isFollowing: !isFollowing } : u)
                );
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    return (
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center py-4 sm:py-6 mx-4 sm:mx-16 xl:mx-28 gap-4 relative">
            {/* Logo */}
            <div className="flex items-center gap-6">
                <img onClick={() => navigate("/")} src={isDarkMode ? assets.logo_light : assets.logo} alt="logo" className="w-28 sm:w-36 cursor-pointer hover:opacity-90 transition-opacity" />
                <button
                    onClick={() => navigate("/explore")}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-violet-500 hover:text-violet-600 transition-all cursor-pointer shadow-sm"
                >
                    🔍 Explore
                </button>
            </div>

            {/* Feature 1: Global Search Bar */}
            <div className="relative flex-1 max-w-md mx-2 order-last md:order-none w-full md:w-auto" ref={searchRef}>
                <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Username, Name, Profile..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchModal(true);
                        }}
                        onFocus={() => setShowSearchModal(true)}
                        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Live Search Suggestions Dropdown */}
                {showSearchModal && searchQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
                        {isSearching ? (
                            /* Requirement 9: Skeleton loading while searching */
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <div key={idx} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length === 0 ? (
                            /* Requirement 8: Empty state 'No users found' with illustration */
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-1">
                                    🔍
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No users found</p>
                                <p className="text-xs text-slate-450">We couldn't find any profile matching "{searchQuery.trim()}"</p>
                            </div>
                        ) : (
                            /* Requirement 6: Instagram style results list */
                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                {searchResults.map((userResult) => {
                                    const uId = userResult.id || userResult._id;
                                    const uUsername = userResult.username;
                                    const uDisplayName = userResult.displayName || userResult.name;
                                    const uImage = userResult.profileImage || userResult.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80";

                                    return (
                                        <div
                                            key={uId}
                                            onClick={() => {
                                                setShowSearchModal(false);
                                                setSearchQuery("");
                                                navigate(`/profile/${uUsername || uId}`);
                                            }}
                                            className="flex items-center justify-between p-3.5 hover:bg-violet-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                <img
                                                    src={uImage}
                                                    alt={uDisplayName}
                                                    className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                                                />
                                                <div className="truncate">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                                                            {uDisplayName}
                                                        </p>
                                                        {userResult.verified && (
                                                            <span className="text-[10px] text-blue-500 font-black bg-blue-500/10 rounded-full px-1 py-0.2" title="Verified User">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                                                        @{uUsername}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-450 mt-0.5">
                                                        <span>👥 {userResult.followersCount || 0} followers</span>
                                                        <span>•</span>
                                                        <span>{userResult.followingCount || 0} following</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {currentUser && (currentUser._id !== uId && currentUser.id !== uId) && (
                                                <button
                                                    onClick={(e) => handleFollowToggleInSearch(userResult, e)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer shadow-sm ${
                                                        userResult.isFollowing
                                                            ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                                            : "bg-violet-600 hover:bg-violet-700 text-white"
                                                    }`}
                                                >
                                                    {userResult.isFollowing ? "Following" : "Follow"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">

                <button
                    onClick={toggleDarkMode}
                    style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', flexShrink: 0, padding: 0 }}
                    className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
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
                        <span className="text-xl leading-none flex items-center justify-center">🌙</span>
                    )}
                </button>

                {/* Notifications Bell Button */}
                {token && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', flexShrink: 0, padding: 0 }}
                            className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative"
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
                )}

                <button onClick={() => navigate(token ? "/author" : "/login")} className="group flex items-center gap-2 rounded-xl text-sm font-bold cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-2.5 shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    {token ? "Dashboard" : "Login"}
                    <img src={assets.arrow} className="w-3 transition-transform duration-300 group-hover:translate-x-1" alt="arrow" />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
