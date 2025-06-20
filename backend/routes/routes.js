import express from 'express';
import { loginUser, sendOtp, verifyOtp } from '../controllers/userController.js';

const router = express.Router();

// Example route
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
