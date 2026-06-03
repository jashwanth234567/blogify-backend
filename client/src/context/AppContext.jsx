import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get("/api/blog/all");
            if (data.success) {
                if (data.blogs && data.blogs.length > 0) {
                    setBlogs(data.blogs);
                } else {
                    // Fall back to local mock data if the database is empty
                    import("../assets/assets").then(({ blog_data }) => {
                        setBlogs(blog_data);
                    });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            import("../assets/assets").then(({ blog_data }) => {
                setBlogs(blog_data);
            }).catch(() => {
                toast.error(error.message);
            });
        }
    };

    const fetchProfile = async (currentToken) => {
        try {
            axios.defaults.headers.common["Authorization"] = `${currentToken}`;
            const { data } = await axios.get("/api/user/me");
            if (data.success) {
                setUser(data.user);
                setIsAdmin(data.user.isAdmin);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchNotifications = async (force = false) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const { data } = await axios.get("/api/notification", {
                headers: { Authorization: token }
            });
            if (data.success) {
                if (force) {
                    // Force replace (initial load)
                    setNotifications(data.notifications);
                } else {
                    // Merge: preserve local isRead=true (don't revert reads done optimistically)
                    setNotifications(prev => {
                        const readSet = new Set(prev.filter(n => n.isRead).map(n => n._id));
                        return data.notifications.map(n => ({
                            ...n,
                            isRead: readSet.has(n._id) ? true : n.isRead,
                        }));
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markNotificationRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.put(`/api/notification/read/${id}`, {}, {
                headers: { Authorization: token }
            });
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.put("/api/notification/read-all", {}, {
                headers: { Authorization: token }
            });
            if (data.success) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                toast.success("All notifications marked as read");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                await axios.post("/api/user/logout");
            }
        } catch (err) {
            console.error("Logout log error:", err);
        }
        localStorage.removeItem("token");
        axios.defaults.headers.common["Authorization"] = null;
        setToken(null);
        setUser(null);
        setIsAdmin(false);
        setNotifications([]);
        navigate("/");
    };

    useEffect(() => {
        fetchBlogs();
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            fetchProfile(storedToken);
            // Force-fetch notifications on initial load
            fetchNotifications(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Periodically fetch notifications if logged in (merge mode - preserves local read state)
    useEffect(() => {
        if (token) {
            const interval = setInterval(() => fetchNotifications(false), 30000);
            return () => clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const value = {
        axios,
        navigate,
        token,
        setToken,
        user,
        setUser,
        isAdmin,
        setIsAdmin,
        notifications,
        setNotifications,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        handleLogout,
        blogs,
        setBlogs,
        input,
        setInput,
        fetchBlogs,
        isDarkMode,
        toggleDarkMode,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
