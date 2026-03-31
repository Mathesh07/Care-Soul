import { Router } from 'express';
import { login, logout, refresh, register } from './controller';
import { authorize, verifyAccessToken } from '../../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', verifyAccessToken, logout);

// Example of role-gated extension endpoint.
router.get('/admin/ping', verifyAccessToken, authorize('admin', 'superadmin'), (_req, res) => {
  res.status(200).json({ success: true, message: 'Admin auth route active.' });
});

export default router;
