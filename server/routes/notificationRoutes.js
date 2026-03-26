

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

// GET /api/notifications/user/me  → get user's notifications (must come before /:id param routes)
router.get('/user/me', getUserNotifications);

// PUT /api/notifications/read-all  → mark all as read (specific route must come before /:id)
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read  → mark one as read
router.put('/:id/read', markAsRead);

export default router;