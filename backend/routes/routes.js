import express from 'express';
import { registerUser, findUserByEmail, loginUser, sendRegisterOtp, verifyRegisterOtp, sendLoginOtp, verifyLoginOtp, getProfile, updateProfile, upload, logoutUser, authMiddleware, checkAuth } from '../controller/userController.js';
import { getAdmins, addAdmin, removeAdmin } from '../controller/adminController.js';
import multer from 'multer';

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

router.post('/api/user/send-register-otp', sendRegisterOtp);
router.post('/api/user/verify-register-otp', verifyRegisterOtp);
router.post('/api/user/send-login-otp', sendLoginOtp);
router.post('/api/user/verify-login-otp', verifyLoginOtp);
router.post('/api/user/register', registerUser);
router.post('/api/user/find', findUserByEmail);
router.post('/api/user/login', loginUser);
router.get('/api/getadmins', getAdmins);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);
router.get('/api/profile', getProfile);
router.put('/api/profile', memoryUpload.single('photo'), updateProfile);
router.post('/api/user/logout', logoutUser);
router.get('/api/user/check-auth', authMiddleware, checkAuth);

export default router;
