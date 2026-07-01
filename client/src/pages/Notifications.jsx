import { useAppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotificationsPage = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigate
  } = useAppContext();

  const handleNotificationClick = (n) => {
    markNotificationRead(n._id);
    if (n.link) {
      navigate(n.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <span className="text-3xl block mb-2">🔔</span>
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors duration-205 ${
                  !n.isRead ? "bg-violet-50/20 dark:bg-violet-950/5" : ""
                }`}
              >
                <div className="mt-0.5">
                  {n.type === "follow" && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 text-base">👤</span>
                  )}
                  {n.type === "like" && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-150 dark:bg-red-950/45 text-red-600 dark:text-red-400 text-base">❤️</span>
                  )}
                  {n.type === "comment" && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 text-base">💬</span>
                  )}
                  {n.type === "publication" && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 text-base">✨</span>
                  )}
                  {n.type === "approval" && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 text-base">✅</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-slate-900 dark:text-white" : "text-slate-650 dark:text-slate-400"}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-violet-600 mt-2 flex-shrink-0 animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
