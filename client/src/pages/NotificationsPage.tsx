import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Navbar } from "../components/ui/navbar";
import { notificationService } from "../services/notificationService";

// TypeScript interface — defines the shape of a notification object
interface Notification {
    _id: string;
    type: "appointment" | "emergency" | "system" | "reminder";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationsPage = () => {
    // useState stores data that can change
    // notifications = current value, setNotifications = function to update it
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // useEffect runs code when component mounts (loads for first time)
    useEffect(() => {
        fetchNotifications();
    }, []); // empty [] means "run once on mount"

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications();
            if (response.success) {
                setNotifications(response.data);
                setUnreadCount(response.unreadCount);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false); // stop loading spinner
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            // Update local state (don't need to refetch from server)
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            // Mark all as read locally
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    // Different icons for different notification types
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "emergency":
                return "🚨";
            case "appointment":
                return "📅";
            case "reminder":
                return "⏰";
            default:
                return "🔔";
        }
    };

    // Format date like "2 hours ago" or "Jan 22"
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${Math.floor(hours)} hours ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Bell className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold text-foreground">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-16 text-foreground/60">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-card rounded-lg p-4 shadow-sm border-l-4 border border-border/60 transition-all ${notification.isRead
                                        ? "border-l-border opacity-70"
                                        : "border-l-primary"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="text-2xl">
                                            {getTypeIcon(notification.type)}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {notification.title}
                                            </h3>
                                            <p className="text-foreground/70 text-sm mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-foreground/50 text-xs mt-2">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mark as read button - only shown for unread */}
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(notification._id)}
                                            className="text-primary hover:text-primary/80 flex-shrink-0"
                                            title="Mark as read"
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
