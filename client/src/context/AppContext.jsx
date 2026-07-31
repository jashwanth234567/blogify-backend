import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const envBaseUrl = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = (envBaseUrl && envBaseUrl.trim() !== "") ? envBaseUrl : "https://blogify-backend1.onrender.com";

// ─── Global Axios Interceptors ───────────────────────────────────────────────
// Request: auto-inject stored token on every request
axios.interceptors.request.use(
    (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken && !config.headers["Authorization"]) {
            config.headers["Authorization"] = storedToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response: auto-clear token if server says it's invalid/expired
axios.interceptors.response.use(
    (response) => {
        // If the server returns { success: false, message: "Invalid token" } or "Not Authorized"
        if (
            response.data &&
            response.data.success === false &&
            (response.data.message === "Invalid token" ||
                response.data.message === "Not Authorized")
        ) {
            // Clear stale token silently
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        }
        return response;
    },
    (error) => Promise.reject(error)
);

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [socket, setSocket] = useState(null);
    const [input, setInput] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    // Initialize Socket.io real-time connection
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
        const socketInstance = io(socketUrl, {
            transports: ["websocket", "polling"],
        });

        socketInstance.on("blog:deleted", ({ blogId }) => {
            setBlogs((prev) => prev.filter((b) => b._id !== blogId));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

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

    const fetchBlogs = async (feedType = "latest", category = "All") => {
        try {
            const storedToken = localStorage.getItem("token");
            const config = storedToken ? { headers: { Authorization: storedToken } } : {};
            const { data } = await axios.get(`/api/blog/all?feed=${feedType}&category=${category}`, config);
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

    // Feature 3: Immediate top insertion of new posts without refresh
    const addPostToFeed = (newBlog) => {
        setBlogs(prev => [newBlog, ...prev]);
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
            // Pre-check token expiry client-side before making any API call
            try {
                const payload = JSON.parse(atob(storedToken.split(".")[1]));
                const isExpired = payload.exp && payload.exp * 1000 < Date.now();
                if (isExpired) {
                    // Token is expired — clear it silently
                    localStorage.removeItem("token");
                    return;
                }
            } catch {
                // Malformed token — clear it
                localStorage.removeItem("token");
                return;
            }
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
        socket,
        input,
        setInput,
        fetchBlogs,
        fetchProfile,
        addPostToFeed,
        isDarkMode,
        toggleDarkMode,
    };


    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
