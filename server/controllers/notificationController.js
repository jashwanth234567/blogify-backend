import Notification from "../models/Notification.js";

// Fetch user notifications
// GET /api/notification
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const query = req.isAdmin
            ? {}
            : {
                  $or: [
                      { user: userId },
                      { user: null, type: { $in: ["publication", "approval"] } }
                  ]
              };

        const dbNotifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        // Map notifications to include isRead based on readBy or specific user's isRead
        const notifications = dbNotifications.map(n => {
            const isRead = n.user ? n.isRead : n.readBy.includes(userId);
            return {
                _id: n._id,
                user: n.user,
                message: n.message,
                type: n.type,
                link: n.link,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
                isRead
            };
        });

        res.json({ success: true, notifications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark notification as read
// PUT /api/notification/read/:id
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.json({ success: false, message: "Notification not found" });
        }

        if (notification.user) {
            // Direct notification
            if (req.isAdmin || notification.user.toString() === userId.toString()) {
                notification.isRead = true;
                await notification.save();
            } else {
                return res.json({ success: false, message: "Unauthorized" });
            }
        } else {
            // Broadcast notification - add user to readBy list if not already there
            if (!notification.readBy.includes(userId)) {
                notification.readBy.push(userId);
                await notification.save();
            }
        }

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark all notifications as read
// PUT /api/notification/read-all
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Mark direct notifications as read
        const directQuery = req.isAdmin ? {} : { user: userId };
        await Notification.updateMany({ ...directQuery, isRead: false }, { isRead: true });

        // 2. Mark broadcast notifications as read by adding userId to readBy
        const broadcastQuery = { user: null };
        if (!req.isAdmin) {
            broadcastQuery.type = { $in: ["publication", "approval"] };
        }
        const broadcasts = await Notification.find(broadcastQuery);
        for (const b of broadcasts) {
            if (!b.readBy.includes(userId)) {
                b.readBy.push(userId);
                await b.save();
            }
        }

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
