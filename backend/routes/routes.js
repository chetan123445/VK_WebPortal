import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp, getProfile, updateProfile, upload } from '../controller/userController.js';
import { getAdmins, addAdmin, removeAdmin } from '../controller/adminController.js';
import multer from 'multer';

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// Public routes
router.post('/api/user/send-register-otp', sendRegisterOtp);
router.post('/api/user/verify-register-otp', verifyRegisterOtp);
router.post('/api/user/send-login-otp', sendLoginOtp);
router.post('/api/user/verify-login-otp', verifyLoginOtp);
router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);

// Protected routes (require JWT authentication)
router.get('/api/verify-token', authenticateToken, verifyToken);
router.get('/api/profile', authenticateToken, getProfile);
router.put('/api/profile', authenticateToken, memoryUpload.single('photo'), updateProfile);

// Admin routes
router.get('/api/getadmins', getAdmins);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);
router.get('/api/profile', getProfile);
router.put('/api/profile', memoryUpload.single('photo'), updateProfile);

export default router;
