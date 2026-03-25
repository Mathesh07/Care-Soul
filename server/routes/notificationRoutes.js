

import express from 'express';
import {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ALL routes below require login (JWT token)
router.use(protect);

// POST /api/notifications/send  → send a notification
router.post('/send', sendNotification);

// GET /api/notifications/user/:id  → get user's notifications
router.get('/user/:id', getUserNotifications);

// PUT /api/notifications/:id/read  → mark one as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/read-all  → mark all as read
router.put('/read-all', markAllAsRead);

export default router;