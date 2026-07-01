import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const Sidebar = ({ collapsed, toggleCollapse }) => {
    const { isAdmin, isDarkMode } = useAppContext();

    const menuItems = [
        { path: "/author",                  label: "Dashboard",          icon: "📊", end: true },
        { path: "/profile",                 label: "My Profile",         icon: "👤" },
        { path: "/trending",                label: "Trending",           icon: "🔥" },
        { path: "/most-liked",              label: "Most Liked",         icon: "❤️" },
        { path: "/most-viewed",             label: "Most Viewed",        icon: "👁" },
        { path: "/notifications",           label: "Notifications",      icon: "🔔" },
        { path: "/author/content-studio",   label: "AI Content Studio",  icon: "🎙️" },
        { path: "/author/add-blog",         label: "AI Blog Generator",  icon: "✨" },
        { path: "/author/chat-assistant",   label: "AI Chat Assistant",  icon: "💬" },
        { path: "/author/seo-optimizer",    label: "AI SEO Optimizer",   icon: "🔍" },
        { path: "/author/translator",       label: "AI Translator",      icon: "🌐" },
        { path: "/author/audio-reader",     label: "AI Audio Reader",    icon: "🔊" },
        { path: "/author/analytics",        label: "AI Analytics",       icon: "📈" },
        { path: "/author/list-blog",        label: "Blogs & Drafts",     icon: "📝" },
        { path: "/author/list-comment",     label: "Comments Center",    icon: "🗨️" },
        { path: "/author/email-center",     label: "Email Center",       icon: "✉️" },
        { path: "/author/news-center",      label: "AI News Center",     icon: "📰" },
        { path: "/author/help-center",      label: "Help Center",        icon: "💡" },
    ];

    return (
        <div
            style={{
                width: collapsed ? "72px" : "260px",
                minWidth: collapsed ? "72px" : "260px",
                background: isDarkMode ? "#020617" : "rgb(219, 218, 218)",
                borderRight: isDarkMode ? "1px solid #1F2937" : "1px solid rgba(148, 163, 184, 0.16)",
                boxShadow: isDarkMode ? "4px 0 24px rgba(0,0,0,0.3)" : "4px 0 24px rgba(15,23,42,0.02)",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
                height: "100%",
                position: "relative",
                overflow: "visible",
            }}
        >
            {/* Collapse Toggle */}
            <button
                onClick={toggleCollapse}
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "-14px",
                    width: "28px",
                    height: "28px",
                    background: isDarkMode ? "#111827" : "#FFFFFF",
                    border: isDarkMode ? "1.5px solid #1F2937" : "1.5px solid rgba(148, 163, 184, 0.18)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: isDarkMode ? "#CBD5E1" : "#64748B",
                    zIndex: 50,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = "#7C3AED";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "#7C3AED";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = isDarkMode ? "#111827" : "#FFFFFF";
                    e.currentTarget.style.color = isDarkMode ? "#CBD5E1" : "#64748B";
                    e.currentTarget.style.borderColor = isDarkMode ? "#1F2937" : "rgba(148, 163, 184, 0.18)";
                }}
            >
                {collapsed ? "→" : "←"}
            </button>

            {/* Logo area */}
            {!collapsed && (
                <div style={{
                    padding: "24px 20px 16px",
                    borderBottom: isDarkMode ? "1px solid #1F2937" : "1px solid #F1F5F9",
                    marginBottom: "8px",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.2)",
                            flexShrink: 0,
                        }}>✍️</div>
                        <div>
                            <div style={{ fontSize: "15px", fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A", letterSpacing: "-0.02em", lineHeight: 1 }}>Blogify AI</div>
                            <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600, marginTop: "2px" }}>Creator Dashboard</div>
                        </div>
                    </div>
                </div>
            )}

            {collapsed && (
                <div style={{
                    padding: "24px 0 16px",
                    display: "flex",
                    justifyContent: "center",
                    borderBottom: isDarkMode ? "1px solid #1F2937" : "1px solid #F1F5F9",
                    marginBottom: "8px",
                }}>
                    <div style={{
                        width: "36px",
                        height: "36px",
                        background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 4px 12px rgba(124,58,237,0.2)",
                    }}>✍️</div>
                </div>
            )}

            {/* Nav Items */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
            }}>
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        end={item.end}
                        to={item.path}
                        style={{ textDecoration: "none" }}
                        className={({ isActive }) =>
                            isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"
                        }
                    >
                        <span style={{ fontSize: "17px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                        {!collapsed && (
                            <span style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>{item.label}</span>
                        )}
                        {/* Tooltip on collapsed */}
                        {collapsed && (
                            <span style={{
                                position: "absolute",
                                left: "60px",
                                background: "#0F172A",
                                color: "#FFFFFF",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                opacity: 0,
                                transition: "opacity 0.15s ease",
                                zIndex: 100,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }} className="sidebar-tooltip">{item.label}</span>
                        )}
                    </NavLink>
                ))}

                {isAdmin && (
                    <NavLink
                        to="/author/admin-analytics"
                        style={{ textDecoration: "none" }}
                        className={({ isActive }) =>
                            isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"
                        }
                    >
                        <span style={{ fontSize: "17px", flexShrink: 0, lineHeight: 1 }}>🛡️</span>
                        {!collapsed && (
                            <span style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>Admin Panel</span>
                        )}
                        {collapsed && (
                            <span style={{
                                position: "absolute",
                                left: "60px",
                                background: "#0F172A",
                                color: "#FFFFFF",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                opacity: 0,
                                transition: "opacity 0.15s ease",
                                zIndex: 100,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }} className="sidebar-tooltip">Admin Panel</span>
                        )}
                    </NavLink>
                )}
            </div>

            {/* Bottom user hint */}
            {!collapsed && (
                <div style={{
                    padding: "16px 20px",
                    borderTop: isDarkMode ? "1px solid #1F2937" : "1px solid #F1F5F9",
                    background: isDarkMode ? "#111827" : "#F8FAFC",
                }}>
                    <div style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        fontWeight: 600,
                        textAlign: "center",
                        letterSpacing: "0.02em",
                    }}>
                        Powered by Gemini AI ✦
                    </div>
                </div>
            )}

            <style>{`
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    color: ${isDarkMode ? "#94A3B8" : "#475569"};
                    transition: all 0.2s ease;
                    position: relative;
                    border: 1.5px solid transparent;
                    text-decoration: none !important;
                }
                .sidebar-link:hover {
                    background: ${isDarkMode ? "#1F2937" : "#F1F5F9"};
                    color: ${isDarkMode ? "#FFFFFF" : "#0F172A"};
                    border-color: ${isDarkMode ? "#374151" : "rgba(148, 163, 184, 0.16)"};
                }
                .sidebar-link:hover .sidebar-tooltip {
                    opacity: 1 !important;
                }
                .sidebar-link--active {
                    background: ${isDarkMode ? "rgba(139,92,246,0.12)" : "rgba(124,58,237,0.06)"};
                    color: ${isDarkMode ? "#C4B5FD" : "#7C3AED"};
                    border-color: ${isDarkMode ? "rgba(139,92,246,0.4)" : "rgba(124,58,237,0.3)"};
                    font-weight: 600;
                }
                .sidebar-link--active:hover {
                    background: ${isDarkMode ? "rgba(139,92,246,0.18)" : "rgba(124,58,237,0.1)"};
                    color: ${isDarkMode ? "#C4B5FD" : "#6D28D9"};
                    border-color: ${isDarkMode ? "rgba(139,92,246,0.5)" : "rgba(124,58,237,0.4)"};
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
