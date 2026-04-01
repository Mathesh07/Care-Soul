import express from "express";

import {login,logout,signup,verifyOtp,resendOtp,refreshToken} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
router.post('/refresh', refreshToken) // Removed protect middleware - refresh doesn't require valid token

export default router;

